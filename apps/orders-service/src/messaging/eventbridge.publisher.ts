import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge'
import { Injectable } from '@nestjs/common'

import {
  buildOrderConfirmedEntry,
  buildOrderCreatedEntry,
  type OrderConfirmedEvent,
  type OrderCreatedEvent
} from '@distrinorte/events'

@Injectable()
export class EventBridgePublisher {
  private readonly client: EventBridgeClient
  private readonly eventBusName: string

  constructor() {
    this.client = new EventBridgeClient({
      region: process.env.AWS_REGION ?? 'us-east-2'
    })
    this.eventBusName = process.env.EVENT_BUS_NAME ?? ''

    if (!this.eventBusName) {
      throw new Error('EVENT_BUS_NAME is required')
    }
  }

  async publishOrderCreated(detail: OrderCreatedEvent): Promise<void> {
    await this.publish(buildOrderCreatedEntry(detail, this.eventBusName))
  }

  async publishOrderConfirmed(detail: OrderConfirmedEvent): Promise<void> {
    await this.publish(buildOrderConfirmedEntry(detail, this.eventBusName))
  }

  private async publish(entry: {
    Source: string
    DetailType: string
    Detail: string
    EventBusName?: string
  }): Promise<void> {
    const response = await this.client.send(
      new PutEventsCommand({
        Entries: [entry]
      })
    )

    if (response.FailedEntryCount && response.FailedEntryCount > 0) {
      throw new Error(`Failed to publish ${entry.DetailType} to EventBridge`)
    }
  }
}
