import {
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient
} from '@aws-sdk/client-sqs'
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common'

import { parseSqsEventBridgeBody } from '@distrinorte/events'

import { ProjectionEventsHandler } from './projection-events.handler.js'

@Injectable()
export class ProjectionsWorkConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProjectionsWorkConsumer.name)
  private readonly client: SQSClient
  private readonly queueUrl: string
  private running = false

  constructor(private readonly projectionEvents: ProjectionEventsHandler) {
    this.client = new SQSClient({
      region: process.env.AWS_REGION ?? 'us-east-2'
    })
    this.queueUrl = process.env.PROJECTIONS_WORK_QUEUE_URL ?? ''
  }

  onModuleInit(): void {
    if (!this.queueUrl) {
      this.logger.warn(
        'PROJECTIONS_WORK_QUEUE_URL not set — projections worker disabled'
      )
      return
    }

    this.running = true
    void this.pollLoop()
  }

  onModuleDestroy(): void {
    this.running = false
  }

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        await this.pollOnce()
      } catch (error) {
        this.logger.error('SQS poll failed', error)
        await sleep(5_000)
      }
    }
  }

  private async pollOnce(): Promise<void> {
    const response = await this.client.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 60
      })
    )

    const message = response.Messages?.[0]
    if (!message?.Body || !message.ReceiptHandle) {
      return
    }

    const detailType = parseSqsEventBridgeBody(message.Body)['detail-type']

    if (!this.projectionEvents.isHandledByOrders(detailType)) {
      await this.releaseMessage(message.ReceiptHandle)
      return
    }

    try {
      await this.projectionEvents.processMessageBody(message.Body)

      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle
        })
      )
    } catch (error) {
      this.logger.error('Failed to process projections-work message', error)
    }
  }

  private async releaseMessage(receiptHandle: string): Promise<void> {
    await this.client.send(
      new ChangeMessageVisibilityCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: 0
      })
    )
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
