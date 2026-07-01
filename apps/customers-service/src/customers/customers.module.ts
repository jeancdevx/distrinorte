import { Module } from '@nestjs/common'

import { MessagingModule } from '../messaging/messaging.module.js'
import { CustomersController } from './customers.controller.js'
import { CustomersService } from './customers.service.js'

@Module({
  imports: [MessagingModule],
  controllers: [CustomersController],
  providers: [CustomersService]
})
export class CustomersModule {}
