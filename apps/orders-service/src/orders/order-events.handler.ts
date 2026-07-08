import { Injectable, Logger } from '@nestjs/common'

import { OrderStatus, type Prisma } from '@distrinorte/database/orders'
import {
  EventDetailType,
  parseSqsEventBridgeBody,
  type StockRejectedEvent,
  type StockReservedEvent
} from '@distrinorte/events'
import { calculateEstimatedDeliveryDate } from '@distrinorte/shared'

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
      case EventDetailType.StockReserved:
        await this.confirmOrder(envelope.detail as StockReservedEvent)
        return
      case EventDetailType.StockRejected:
        await this.rejectOrderFromEvent(envelope.detail as StockRejectedEvent)
        return
      default:
        this.logger.warn(
          `Ignoring unsupported event ${envelope['detail-type']}`
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

    if (order.status !== OrderStatus.PENDING) {
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

    const confirmedAt = new Date(detail.confirmedAt ?? new Date().toISOString())
    const estimatedDeliveryDate = calculateEstimatedDeliveryDate(
      order.warehouseId,
      detail.fulfillment ?? [],
      detail.transferMatrix ?? [],
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
        fulfillment: detail.fulfillment ?? [],
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
        status: OrderStatus.PENDING
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
}
