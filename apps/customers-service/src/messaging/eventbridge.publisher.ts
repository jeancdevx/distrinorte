import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge'
import { Injectable, Logger } from '@nestjs/common'

import {
  buildCustomerRegisteredEntry,
  buildCustomerUpdatedEntry,
  type CustomerRegisteredEvent,
  type CustomerUpdatedEvent
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

  async publishCustomerRegistered(
    detail: CustomerRegisteredEvent
  ): Promise<void> {
    await this.publish(buildCustomerRegisteredEntry(detail, this.eventBusName))
  }

  async publishCustomerUpdated(detail: CustomerUpdatedEvent): Promise<void> {
    await this.publish(buildCustomerUpdatedEntry(detail, this.eventBusName))
  }

  private async publish(entry: {
    Source: string
    DetailType: string
    Detail: string
    EventBusName?: string
  }): Promise<void> {
    if (!this.eventBusName) {
      this.logger.warn('EVENT_BUS_NAME not set — customer event not published')
      return
    }

    const response = await this.client.send(
      new PutEventsCommand({
        Entries: [entry]
      })
    )

    if (response.FailedEntryCount && response.FailedEntryCount > 0) {
      throw new Error('Failed to publish customer event to EventBridge')
    }
  }
}
