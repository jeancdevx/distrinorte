import { randomUUID } from 'node:crypto'

import { Injectable, Logger } from '@nestjs/common'

import {
  EventDetailType,
  parseSqsEventBridgeBody,
  type OrderCreatedEvent,
  type OrderLine
} from '@distrinorte/events'

import { PrismaService } from '../database/prisma.service.js'
import { EventBridgePublisher } from '../messaging/eventbridge.publisher.js'
import { InventoryService } from './inventory.service.js'

type AvailabilityResult =
  | { ok: true }
  | { ok: false; reason: string; lines: OrderLine[] }

@Injectable()
export class StockReservationService {
  private readonly logger = new Logger(StockReservationService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly eventBridge: EventBridgePublisher
  ) {}

  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const existingReservations = await this.prisma.db.reservation.count({
      where: { orderId: event.orderId }
    })

    if (existingReservations > 0) {
      this.logger.warn(`Order ${event.orderId} already processed — skipping`)
      return
    }

    const availability = await this.checkAvailability(
      event.lines,
      event.warehouseId
    )

    if (!availability.ok) {
      await this.eventBridge.publishStockRejected({
        orderId: event.orderId,
        reason: availability.reason,
        lines: availability.lines,
        correlationId: event.correlationId
      })

      return
    }

    const reservationId = randomUUID()

    await this.prisma.db.$transaction(async tx => {
      for (const line of event.lines) {
        const inventory = await tx.inventory.update({
          where: {
            sku_warehouseId: {
              sku: line.sku,
              warehouseId: event.warehouseId
            }
          },
          data: {
            quantity: {
              decrement: line.quantity
            }
          }
        })

        await tx.reservation.create({
          data: {
            id: randomUUID(),
            orderId: event.orderId,
            sku: line.sku,
            warehouseId: event.warehouseId,
            quantity: line.quantity
          }
        })

        await this.inventoryService.setStockCache(
          line.sku,
          event.warehouseId,
          inventory.quantity
        )
      }
    })

    await this.eventBridge.publishStockReserved({
      orderId: event.orderId,
      reservationId,
      lines: event.lines,
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

  private async checkAvailability(
    lines: OrderLine[],
    warehouseId: string
  ): Promise<AvailabilityResult> {
    for (const line of lines) {
      const quantity = await this.inventoryService.getStockFromDatabase(
        line.sku,
        warehouseId
      )

      if (quantity === null || quantity < line.quantity) {
        return {
          ok: false,
          reason:
            quantity === null
              ? `Stock not found for ${line.sku}`
              : `Insufficient stock for ${line.sku}`,
          lines
        }
      }
    }

    return { ok: true }
  }
}
