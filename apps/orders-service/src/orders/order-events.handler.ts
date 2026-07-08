import { Injectable, Logger } from '@nestjs/common'

import { OrderStatus, type Prisma } from '@distrinorte/database/orders'
import {
  EventDetailType,
  parseSqsEventBridgeBody,
  type InvoiceFailedEvent,
  type InvoiceIssuedEvent,
  type StockPendingTransferEvent,
  type StockRejectedEvent,
  type StockReservedEvent
} from '@distrinorte/events'
import {
  calculateEstimatedDeliveryDate,
  type TransferMatrixEntry
} from '@distrinorte/shared'

import { PrismaService } from '../database/prisma.service.js'
import { OutboxProcessor } from '../outbox/outbox.processor.js'

@Injectable()
export class OrderEventsHandler {
  private readonly logger = new Logger(OrderEventsHandler.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxProcessor: OutboxProcessor
  ) {}

  async processMessageBody(body: string): Promise<void> {
    const envelope = parseSqsEventBridgeBody(body)

    switch (envelope['detail-type']) {
      case EventDetailType.StockPendingTransfer:
        await this.markAwaitingTransfer(
          envelope.detail as StockPendingTransferEvent
        )
        return
      case EventDetailType.StockReserved:
        await this.confirmOrder(envelope.detail as StockReservedEvent)
        return
      case EventDetailType.StockRejected:
        await this.rejectOrderFromEvent(envelope.detail as StockRejectedEvent)
        return
      case EventDetailType.InvoiceIssued:
        await this.attachInvoice(envelope.detail as InvoiceIssuedEvent)
        return
      case EventDetailType.InvoiceFailed:
        await this.logInvoiceFailure(envelope.detail as InvoiceFailedEvent)
        return
      default:
        this.logger.warn(
          `Ignoring unsupported event ${envelope['detail-type']}`
        )
    }
  }

  private async markAwaitingTransfer(
    detail: StockPendingTransferEvent
  ): Promise<void> {
    const result = await this.prisma.db.order.updateMany({
      where: {
        id: detail.orderId,
        status: OrderStatus.PENDING
      },
      data: {
        status: OrderStatus.AWAITING_TRANSFER
      }
    })

    if (result.count === 0) {
      this.logger.warn(
        `Order ${detail.orderId} was not pending — skip awaiting transfer`
      )
    }
  }

  private async confirmOrder(detail: StockReservedEvent): Promise<void> {
    const order = await this.prisma.db.order.findUnique({
      where: { id: detail.orderId },
      include: { lines: true }
    })

    if (!order) {
      this.logger.warn(`Order ${detail.orderId} not found — skip confirm`)
      return
    }

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.AWAITING_TRANSFER
    ) {
      this.logger.warn(
        `Order ${detail.orderId} is ${order.status} — skip confirm`
      )
      return
    }

    const snapshot = await this.prisma.db.customerSnapshot.findUnique({
      where: { customerId: order.customerId }
    })

    if (!snapshot) {
      this.logger.error(
        `Customer snapshot missing for order ${detail.orderId} at confirm`
      )
      return
    }

    const matrix = detail.transferMatrix.map(row => ({
      fromWarehouseId: row.fromWarehouseId,
      toWarehouseId: row.toWarehouseId,
      businessDays: row.businessDays,
      cutoffHour: row.cutoffHour
    })) satisfies TransferMatrixEntry[]

    const confirmedAt = new Date(detail.confirmedAt)
    const estimatedDeliveryDate = calculateEstimatedDeliveryDate(
      order.warehouseId,
      detail.fulfillment,
      matrix,
      confirmedAt
    )

    await this.prisma.db.$transaction(async tx => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          estimatedDeliveryDate
        }
      })

      const confirmedPayload = {
        orderId: order.id,
        customerId: order.customerId,
        warehouseId: order.warehouseId,
        taxId: snapshot.taxId,
        lines: order.lines.map(line => ({
          sku: line.sku,
          quantity: line.quantity,
          unitPriceNet: Number(line.unitPriceNet),
          saleUnit: line.saleUnit,
          unitsPerBaseUnit: line.unitsPerBaseUnit,
          taxAffectation: line.taxAffectation,
          lineNet: Number(line.lineNet),
          lineTax: Number(line.lineTax),
          lineGross: Number(line.lineGross)
        })),
        totalNet: Number(order.totalNet ?? 0),
        totalTax: Number(order.totalTax ?? 0),
        totalGross: Number(order.totalGross ?? 0),
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
        fulfillment: detail.fulfillment,
        correlationId: detail.correlationId
      }

      await tx.outboxEvent.create({
        data: {
          aggregateType: 'order',
          aggregateId: order.id,
          eventType: EventDetailType.OrderConfirmed,
          payload: confirmedPayload as unknown as Prisma.InputJsonValue
        }
      })
    })

    await this.outboxProcessor.flush()
  }

  private async rejectOrder(orderId: string, reason: string): Promise<void> {
    const result = await this.prisma.db.order.updateMany({
      where: {
        id: orderId,
        status: {
          in: [OrderStatus.PENDING, OrderStatus.AWAITING_TRANSFER]
        }
      },
      data: {
        status: OrderStatus.REJECTED,
        rejectionReason: reason
      }
    })

    if (result.count === 0) {
      this.logger.warn(`Order ${orderId} was not pending — skip reject`)
    }
  }

  private async rejectOrderFromEvent(
    detail: StockRejectedEvent
  ): Promise<void> {
    await this.rejectOrder(detail.orderId, detail.reason)
  }

  private async attachInvoice(detail: InvoiceIssuedEvent): Promise<void> {
    await this.prisma.db.order.updateMany({
      where: { id: detail.orderId },
      data: {
        invoiceId: detail.invoiceId,
        pdfUrl: detail.pdfKey
      }
    })
  }

  private async logInvoiceFailure(detail: InvoiceFailedEvent): Promise<void> {
    this.logger.error(
      `Invoice failed for order ${detail.orderId}: ${detail.reason}`
    )
  }
}
