import { Module } from '@nestjs/common'

import { CustomersClient } from '../clients/customers.client.js'
import { MessagingModule } from '../messaging/messaging.module.js'
import { OrdersEventsConsumer } from '../messaging/orders-events.consumer.js'
import { OrderEventsHandler } from './order-events.handler.js'
import { OrdersController } from './orders.controller.js'
import { OrdersService } from './orders.service.js'

@Module({
  imports: [MessagingModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderEventsHandler,
    OrdersEventsConsumer,
    CustomersClient
  ]
})
export class OrdersModule {}
