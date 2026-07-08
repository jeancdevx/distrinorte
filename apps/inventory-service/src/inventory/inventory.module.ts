import { Module } from '@nestjs/common'

import { InventoryWorkConsumer } from '../messaging/inventory-work.consumer.js'
import { MessagingModule } from '../messaging/messaging.module.js'
import { InventoryController } from './inventory.controller.js'
import { InventoryService } from './inventory.service.js'
import { SourcingService } from './sourcing.service.js'
import { StockReservationService } from './stock-reservation.service.js'

@Module({
  imports: [MessagingModule],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    SourcingService,
    StockReservationService,
    InventoryWorkConsumer
  ],
  exports: [InventoryService, StockReservationService]
})
export class InventoryModule {}
