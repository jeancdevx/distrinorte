import { Injectable, Logger } from '@nestjs/common'

import { OrderStatus } from '@distrinorte/database'
import {
  EventDetailType,
  parseSqsEventBridgeBody,
  type StockRejectedEvent,
  type StockReservedEvent
} from '@distrinorte/events'

import { PrismaService } from '../database/prisma.service.js'

@Injectable()
export class OrderEventsHandler {
  private readonly logger = new Logger(OrderEventsHandler.name)

  constructor(private readonly prisma: PrismaService) {}

  async processMessageBody(body: string): Promise<void> {
    const envelope = parseSqsEventBridgeBody<
      StockReservedEvent | StockRejectedEvent
    >(body)

    if (envelope['detail-type'] === EventDetailType.StockReserved) {
      await this.confirmOrder(envelope.detail.orderId)
      return
    }

    if (envelope['detail-type'] === EventDetailType.StockRejected) {
      const detail = envelope.detail as StockRejectedEvent
      await this.rejectOrder(detail.orderId, detail.reason)
      return
    }

    this.logger.warn(`Ignoring unsupported event ${envelope['detail-type']}`)
  }

  private async confirmOrder(orderId: string): Promise<void> {
    const result = await this.prisma.db.order.updateMany({
      where: {
        id: orderId,
        status: OrderStatus.PENDING
      },
      data: {
        status: OrderStatus.CONFIRMED
      }
    })

    if (result.count === 0) {
      this.logger.warn(`Order ${orderId} was not pending — skip confirm`)
    }
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
}
