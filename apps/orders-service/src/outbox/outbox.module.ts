import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module.js'
import { EventBridgePublisher } from '../messaging/eventbridge.publisher.js'
import { OutboxProcessor } from './outbox.processor.js'

@Module({
  imports: [DatabaseModule],
  providers: [EventBridgePublisher, OutboxProcessor],
  exports: [OutboxProcessor]
})
export class OutboxModule {}
