import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge'

import {
  buildAvailabilityUpdatedEntry,
  buildCatalogPriceUpdatedEntry,
  type AvailabilityUpdatedEvent,
  type CatalogPriceUpdatedEvent
} from '@distrinorte/events'

export async function publishCatalogPriceUpdated(
  detail: CatalogPriceUpdatedEvent
): Promise<void> {
  await publishEntry(
    buildCatalogPriceUpdatedEntry(detail, resolveEventBusName())
  )
}

export async function publishAvailabilityUpdated(
  detail: AvailabilityUpdatedEvent
): Promise<void> {
  await publishEntry(
    buildAvailabilityUpdatedEntry(detail, resolveEventBusName())
  )
}

async function publishEntry(entry: {
  Source: string
  DetailType: string
  Detail: string
  EventBusName?: string
}): Promise<void> {
  const eventBusName = resolveEventBusName()

  if (!eventBusName) {
    console.log(`Skip event ${entry.DetailType} — EVENT_BUS_NAME not set`)
    return
  }

  const client = new EventBridgeClient({
    region: process.env.AWS_REGION ?? 'us-east-2'
  })

  const response = await client.send(
    new PutEventsCommand({
      Entries: [{ ...entry, EventBusName: eventBusName }]
    })
  )

  if (response.FailedEntryCount && response.FailedEntryCount > 0) {
    throw new Error(`Failed to publish ${entry.DetailType}`)
  }
}

function resolveEventBusName(): string | undefined {
  const configured = process.env.EVENT_BUS_NAME
  return configured && configured.length > 0 ? configured : undefined
}
