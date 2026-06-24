import { Module } from '@nestjs/common'

import { MessagingModule } from '../messaging/messaging.module.js'
import { OrdersEventsConsumer } from '../messaging/orders-events.consumer.js'
import { OrderEventsHandler } from './order-events.handler.js'
import { OrdersController } from './orders.controller.js'
import { OrdersService } from './orders.service.js'

@Module({
  imports: [MessagingModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderEventsHandler, OrdersEventsConsumer]
})
export class OrdersModule {}
