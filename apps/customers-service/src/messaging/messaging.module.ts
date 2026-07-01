import { Module } from '@nestjs/common'

import { EventBridgePublisher } from './eventbridge.publisher.js'

@Module({
  providers: [EventBridgePublisher],
  exports: [EventBridgePublisher]
})
export class MessagingModule {}
