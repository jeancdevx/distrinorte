import { randomUUID } from 'node:crypto'

import { Logger } from '@aws-lambda-powertools/logger'
import {
  ConditionalCheckFailedException,
  DynamoDBClient
} from '@aws-sdk/client-dynamodb'
import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb'

import {
  buildInvoiceFailedEntry,
  buildInvoiceIssuedEntry,
  type OrderConfirmedEvent
} from '@distrinorte/events'

import { renderInvoicePdf } from './invoice-pdf.js'

const SEQUENCE_PK = 'SEQUENCE#invoiceNumber'
const logger = new Logger({ serviceName: 'invoice-worker' })

export async function processOrderConfirmed(
  order: OrderConfirmedEvent
): Promise<void> {
  const region = process.env.AWS_REGION ?? 'us-east-2'
  const invoicesTable = requiredEnv('DYNAMODB_INVOICES_TABLE')
  const invoicesBucket = requiredEnv('INVOICES_BUCKET')
  const eventBusName = requiredEnv('EVENT_BUS_NAME')

  const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region }))
  const s3 = new S3Client({ region })
  const eventBridge = new EventBridgeClient({ region })

  try {
    const invoiceNumber = await nextInvoiceNumber(dynamo, invoicesTable)
    const invoiceId = randomUUID()
    const year = new Date().getUTCFullYear()
    const pdfKey = `invoices/${year}/${invoiceNumber}.pdf`

    logger.info('Rendering invoice PDF', {
      orderId: order.orderId,
      invoiceId,
      invoiceNumber,
      correlationId: order.correlationId
    })

    const pdfBytes = await renderInvoicePdf(invoiceNumber, order)

    await s3.send(
      new PutObjectCommand({
        Bucket: invoicesBucket,
        Key: pdfKey,
        Body: pdfBytes,
        ContentType: 'application/pdf'
      })
    )

    logger.info('Uploaded invoice PDF', {
      orderId: order.orderId,
      pdfKey,
      bucket: invoicesBucket
    })

    await dynamo.send(
      new PutCommand({
        TableName: invoicesTable,
        Item: {
          orderId: order.orderId,
          invoiceId,
          invoiceNumber,
          customerId: order.customerId,
          status: 'ISSUED',
          pdfKey,
          totalGross: order.totalGross,
          issuedAt: new Date().toISOString()
        },
        ConditionExpression: 'attribute_not_exists(orderId)'
      })
    )

    const issuedEntry = buildInvoiceIssuedEntry(
      {
        orderId: order.orderId,
        invoiceId,
        invoiceNumber,
        pdfKey,
        correlationId: order.correlationId
      },
      eventBusName
    )

    await eventBridge.send(
      new PutEventsCommand({
        Entries: [issuedEntry]
      })
    )

    logger.info('Published invoice.issued', {
      orderId: order.orderId,
      invoiceId,
      invoiceNumber,
      correlationId: order.correlationId
    })
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'Unknown invoice worker error'

    logger.error('Invoice processing failed', {
      orderId: order.orderId,
      reason,
      correlationId: order.correlationId,
      error: error instanceof Error ? error.stack : String(error)
    })

    const failedEntry = buildInvoiceFailedEntry(
      {
        orderId: order.orderId,
        reason,
        correlationId: order.correlationId
      },
      eventBusName
    )

    await eventBridge.send(
      new PutEventsCommand({
        Entries: [failedEntry]
      })
    )

    throw error
  }
}

async function nextInvoiceNumber(
  dynamo: DynamoDBDocumentClient,
  tableName: string
): Promise<string> {
  try {
    const response = await dynamo.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { orderId: SEQUENCE_PK },
        UpdateExpression:
          'SET currentNumber = if_not_exists(currentNumber, :start) + :inc',
        ExpressionAttributeValues: {
          ':start': 0,
          ':inc': 1
        },
        ReturnValues: 'UPDATED_NEW'
      })
    )

    const current = Number(response.Attributes?.currentNumber ?? 1)
    return String(current).padStart(8, '0')
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      throw error
    }

    throw error
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}
