import { Module } from '@nestjs/common'

import { MessagingModule } from '../messaging/messaging.module.js'
import { OrdersEventsConsumer } from '../messaging/orders-events.consumer.js'
import { OutboxModule } from '../outbox/outbox.module.js'
import { ProjectionsModule } from '../projections/projections.module.js'
import { OrderEventsHandler } from './order-events.handler.js'
import { OrdersController } from './orders.controller.js'
import { OrdersService } from './orders.service.js'

@Module({
  imports: [MessagingModule, OutboxModule, ProjectionsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderEventsHandler, OrdersEventsConsumer]
})
export class OrdersModule {}
