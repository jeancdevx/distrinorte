import { randomUUID } from 'node:crypto'

import { Injectable, Logger } from '@nestjs/common'

import {
  ReservationStatus,
  StockTransferStatus
} from '@distrinorte/database/inventory'
import {
  EventDetailType,
  parseSqsEventBridgeBody,
  type OrderCreatedEvent
} from '@distrinorte/events'

import { PrismaService } from '../database/prisma.service.js'
import { EventBridgePublisher } from '../messaging/eventbridge.publisher.js'
import { InventoryService } from './inventory.service.js'
import { SourcingService } from './sourcing.service.js'

@Injectable()
export class StockReservationService {
  private readonly logger = new Logger(StockReservationService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly eventBridge: EventBridgePublisher,
    private readonly sourcingService: SourcingService
  ) {}

  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const existingReservations = await this.prisma.db.reservation.count({
      where: { orderId: event.orderId }
    })

    if (existingReservations > 0) {
      this.logger.warn(`Order ${event.orderId} already processed — skipping`)
      return
    }

    const sourcing = await this.sourcingService.planOrder(
      event.warehouseId,
      event.lines,
      (sku, warehouseId) =>
        this.inventoryService.getStockFromDatabase(sku, warehouseId)
    )

    if (!sourcing.ok) {
      await this.eventBridge.publishStockRejected({
        orderId: event.orderId,
        reason: sourcing.reason,
        lines: event.lines,
        lineDetails: sourcing.lineDetails,
        correlationId: event.correlationId
      })

      return
    }

    const { plan } = sourcing
    const transferId = randomUUID()
    const reservationId = randomUUID()
    const matrix = await this.loadTransferMatrix(event.warehouseId)

    await this.prisma.db.$transaction(async tx => {
      for (const line of plan.lines) {
        for (const transfer of line.transfers) {
          await tx.inventory.update({
            where: {
              sku_warehouseId: {
                sku: line.sku,
                warehouseId: transfer.fromWarehouseId
              }
            },
            data: { quantity: { decrement: transfer.quantityBase } }
          })
        }

        if (line.localBase > 0) {
          await tx.inventory.update({
            where: {
              sku_warehouseId: {
                sku: line.sku,
                warehouseId: plan.destinationWarehouseId
              }
            },
            data: { quantity: { decrement: line.localBase } }
          })
        }

        await tx.reservation.create({
          data: {
            id: randomUUID(),
            orderId: event.orderId,
            sku: line.sku,
            warehouseId: plan.destinationWarehouseId,
            quantity: line.requiredBase,
            status: plan.requiresTransfer
              ? ReservationStatus.PENDING_TRANSFER
              : ReservationStatus.CONFIRMED
          }
        })
      }

      if (plan.requiresTransfer) {
        await tx.stockTransfer.create({
          data: {
            id: transferId,
            orderId: event.orderId,
            destinationWarehouseId: plan.destinationWarehouseId,
            status: StockTransferStatus.ALLOCATED,
            lines: {
              create: plan.lines.flatMap(line =>
                line.transfers.map(transfer => ({
                  id: randomUUID(),
                  sku: line.sku,
                  fromWarehouseId: transfer.fromWarehouseId,
                  quantityBase: transfer.quantityBase
                }))
              )
            }
          }
        })
      }
    })

    const touchedSkus = new Set(event.lines.map(line => line.sku))
    const touchedWarehouses = new Set<string>([plan.destinationWarehouseId])
    for (const item of plan.fulfillment) {
      touchedWarehouses.add(item.warehouseId)
    }

    for (const warehouseId of touchedWarehouses) {
      for (const sku of touchedSkus) {
        const quantity = await this.inventoryService.getStockFromDatabase(
          sku,
          warehouseId
        )

        if (quantity === null) {
          continue
        }

        await this.inventoryService.setStockCache(sku, warehouseId, quantity)
        await this.eventBridge.publishAvailabilityUpdated({
          warehouseId,
          sku,
          availableQty: quantity,
          asOf: new Date().toISOString(),
          correlationId: event.correlationId
        })
      }
    }

    if (plan.requiresTransfer) {
      await this.eventBridge.publishStockPendingTransfer({
        orderId: event.orderId,
        destinationWarehouseId: plan.destinationWarehouseId,
        transferId,
        fulfillment: plan.fulfillment,
        correlationId: event.correlationId
      })

      await this.prisma.db.stockTransfer.update({
        where: { id: transferId },
        data: {
          status: StockTransferStatus.COMPLETED,
          completedAt: new Date()
        }
      })

      await this.prisma.db.reservation.updateMany({
        where: { orderId: event.orderId },
        data: { status: ReservationStatus.CONFIRMED }
      })

      await this.eventBridge.publishStockTransferCompleted({
        orderId: event.orderId,
        transferId,
        correlationId: event.correlationId
      })
    }

    const confirmedAt = new Date()
    const transferDays = this.calculateTransferDays(
      plan.destinationWarehouseId,
      plan.fulfillment,
      matrix,
      confirmedAt
    )

    await this.eventBridge.publishStockReserved({
      orderId: event.orderId,
      reservationId,
      lines: event.lines,
      fulfillment: plan.fulfillment,
      transferDays,
      transferMatrix: matrix,
      confirmedAt: confirmedAt.toISOString(),
      correlationId: event.correlationId
    })
  }

  async processMessageBody(body: string): Promise<void> {
    const envelope = parseSqsEventBridgeBody<OrderCreatedEvent>(body)

    if (envelope['detail-type'] !== EventDetailType.OrderCreated) {
      this.logger.warn(`Ignoring unsupported event ${envelope['detail-type']}`)
      return
    }

    await this.handleOrderCreated(envelope.detail)
  }

  private async loadTransferMatrix(destinationWarehouseId: string) {
    const rows = await this.prisma.db.transferMatrix.findMany({
      where: { toWarehouseId: destinationWarehouseId }
    })

    return rows.map(row => ({
      fromWarehouseId: row.fromWarehouseId,
      toWarehouseId: row.toWarehouseId,
      businessDays: row.businessDays,
      cutoffHour: row.cutoffHour
    }))
  }

  private calculateTransferDays(
    destinationWarehouseId: string,
    fulfillment: Array<{ warehouseId: string }>,
    matrix: Array<{
      fromWarehouseId: string
      businessDays: number
      cutoffHour: number
    }>,
    confirmedAt: Date
  ): number {
    let transferDays = 0

    for (const item of fulfillment) {
      if (item.warehouseId === destinationWarehouseId) {
        continue
      }

      const entry = matrix.find(row => row.fromWarehouseId === item.warehouseId)

      if (entry) {
        transferDays = Math.max(transferDays, entry.businessDays)
      }
    }

    const cutoffHour =
      matrix.find(row => row.fromWarehouseId === destinationWarehouseId)
        ?.cutoffHour ?? 14

    if (confirmedAt.getHours() >= cutoffHour) {
      transferDays += 1
    }

    return transferDays
  }
}
