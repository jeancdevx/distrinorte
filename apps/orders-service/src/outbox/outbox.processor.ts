import { Injectable } from '@nestjs/common'

import { EventDetailType } from '@distrinorte/events'

import { PrismaService } from '../database/prisma.service.js'
import { EventBridgePublisher } from '../messaging/eventbridge.publisher.js'

@Injectable()
export class OutboxProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBridge: EventBridgePublisher
  ) {}

  async flush(limit = 20): Promise<void> {
    const pending = await this.prisma.db.outboxEvent.findMany({
      where: { publishedAt: null },
      orderBy: { createdAt: 'asc' },
      take: limit
    })

    for (const row of pending) {
      if (row.eventType === EventDetailType.OrderCreated) {
        await this.eventBridge.publishOrderCreated(row.payload as never)
      } else if (row.eventType === EventDetailType.OrderConfirmed) {
        await this.eventBridge.publishOrderConfirmed(row.payload as never)
      } else {
        throw new Error(`Unsupported outbox event type: ${row.eventType}`)
      }

      await this.prisma.db.outboxEvent.update({
        where: { id: row.id },
        data: { publishedAt: new Date() }
      })
    }
  }
}
