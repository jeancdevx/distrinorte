import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge'
import { Injectable } from '@nestjs/common'

import {
  buildAvailabilityUpdatedEntry,
  buildStockPendingTransferEntry,
  buildStockRejectedEntry,
  buildStockReservedEntry,
  buildStockTransferCompletedEntry,
  type AvailabilityUpdatedEvent,
  type StockPendingTransferEvent,
  type StockRejectedEvent,
  type StockReservedEvent,
  type StockTransferCompletedEvent
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

  async publishStockReserved(detail: StockReservedEvent): Promise<void> {
    await this.publish(buildStockReservedEntry(detail, this.eventBusName))
  }

  async publishStockRejected(detail: StockRejectedEvent): Promise<void> {
    await this.publish(buildStockRejectedEntry(detail, this.eventBusName))
  }

  async publishStockPendingTransfer(
    detail: StockPendingTransferEvent
  ): Promise<void> {
    await this.publish(
      buildStockPendingTransferEntry(detail, this.eventBusName)
    )
  }

  async publishStockTransferCompleted(
    detail: StockTransferCompletedEvent
  ): Promise<void> {
    await this.publish(
      buildStockTransferCompletedEntry(detail, this.eventBusName)
    )
  }

  async publishAvailabilityUpdated(
    detail: AvailabilityUpdatedEvent
  ): Promise<void> {
    await this.publish(buildAvailabilityUpdatedEntry(detail, this.eventBusName))
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
      throw new Error('Failed to publish event to EventBridge')
    }
  }
}
