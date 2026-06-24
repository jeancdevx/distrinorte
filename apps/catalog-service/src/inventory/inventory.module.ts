import { Module } from '@nestjs/common'

import { InventoryStockClient } from './inventory-stock.client.js'

@Module({
  providers: [InventoryStockClient],
  exports: [InventoryStockClient]
})
export class InventoryModule {}
