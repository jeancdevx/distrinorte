import {
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

import { OrderEventsHandler } from '../orders/order-events.handler.js'

@Injectable()
export class OrdersEventsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrdersEventsConsumer.name)
  private readonly client: SQSClient
  private readonly queueUrl: string
  private running = false

  constructor(private readonly orderEvents: OrderEventsHandler) {
    this.client = new SQSClient({
      region: process.env.AWS_REGION ?? 'us-east-2'
    })
    this.queueUrl = process.env.ORDERS_EVENTS_QUEUE_URL ?? ''
  }

  onModuleInit(): void {
    if (!this.queueUrl) {
      this.logger.warn('ORDERS_EVENTS_QUEUE_URL not set — SQS worker disabled')
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

    try {
      await this.orderEvents.processMessageBody(message.Body)

      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle
        })
      )
    } catch (error) {
      this.logger.error('Failed to process orders-events message', error)
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
