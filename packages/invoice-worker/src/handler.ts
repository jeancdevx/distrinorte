import type { SQSEvent, SQSHandler } from 'aws-lambda'

import {
  EventDetailType,
  parseSqsEventBridgeBody,
  type OrderConfirmedEvent
} from '@distrinorte/events'

import { processOrderConfirmed } from './process-order-confirmed.js'

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const envelope = parseSqsEventBridgeBody<OrderConfirmedEvent>(record.body)

    if (envelope['detail-type'] !== EventDetailType.OrderConfirmed) {
      throw new Error(`Unsupported detail-type ${envelope['detail-type']}`)
    }

    await processOrderConfirmed(envelope.detail)
  }
}
