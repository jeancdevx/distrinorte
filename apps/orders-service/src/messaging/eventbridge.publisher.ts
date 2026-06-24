import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge'
import { Injectable } from '@nestjs/common'

import {
  buildOrderCreatedEntry,
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
    const entry = buildOrderCreatedEntry(detail, this.eventBusName)

    const response = await this.client.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: entry.Source,
            DetailType: entry.DetailType,
            Detail: entry.Detail,
            EventBusName: entry.EventBusName
          }
        ]
      })
    )

    if (response.FailedEntryCount && response.FailedEntryCount > 0) {
      throw new Error('Failed to publish order.created to EventBridge')
    }
  }
}
