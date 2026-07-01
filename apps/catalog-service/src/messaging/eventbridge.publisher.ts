import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge'
import { Injectable, Logger } from '@nestjs/common'

import {
  buildCatalogPriceUpdatedEntry,
  type CatalogPriceUpdatedEvent
} from '@distrinorte/events'

@Injectable()
export class EventBridgePublisher {
  private readonly logger = new Logger(EventBridgePublisher.name)
  private readonly client: EventBridgeClient
  private readonly eventBusName: string

  constructor() {
    this.client = new EventBridgeClient({
      region: process.env.AWS_REGION ?? 'us-east-2'
    })
    this.eventBusName = process.env.EVENT_BUS_NAME ?? ''
  }

  async publishCatalogPriceUpdated(
    detail: CatalogPriceUpdatedEvent
  ): Promise<void> {
    if (!this.eventBusName) {
      this.logger.warn(
        'EVENT_BUS_NAME not set — catalog price event not published'
      )
      return
    }

    const entry = buildCatalogPriceUpdatedEntry(detail, this.eventBusName)
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
      throw new Error('Failed to publish catalog.price_updated to EventBridge')
    }
  }
}
