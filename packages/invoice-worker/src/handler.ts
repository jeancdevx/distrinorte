import { Logger } from '@aws-lambda-powertools/logger'
import type { SQSEvent, SQSHandler } from 'aws-lambda'

import {
  EventDetailType,
  parseSqsEventBridgeBody,
  type OrderConfirmedEvent
} from '@distrinorte/events'

import { processOrderConfirmed } from './process-order-confirmed.js'

const logger = new Logger({ serviceName: 'invoice-worker' })

export const handler: SQSHandler = async (event: SQSEvent) => {
  logger.info('SQS batch received', { records: event.Records.length })

  for (const record of event.Records) {
    const envelope = parseSqsEventBridgeBody<OrderConfirmedEvent>(record.body)

    if (envelope['detail-type'] !== EventDetailType.OrderConfirmed) {
      logger.warn('Unsupported detail-type in SQS record', {
        detailType: envelope['detail-type']
      })
      throw new Error(`Unsupported detail-type ${envelope['detail-type']}`)
    }

    logger.info('Processing order.confirmed', {
      orderId: envelope.detail.orderId,
      customerId: envelope.detail.customerId,
      warehouseId: envelope.detail.warehouseId,
      correlationId: envelope.detail.correlationId
    })

    await processOrderConfirmed(envelope.detail)

    logger.info('Processed order.confirmed', {
      orderId: envelope.detail.orderId,
      correlationId: envelope.detail.correlationId
    })
  }
}
