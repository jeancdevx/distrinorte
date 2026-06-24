import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Query
} from '@nestjs/common'

import { HttpHeaders, ok } from '@distrinorte/shared'

import { InventoryService } from './inventory.service.js'

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock/:sku')
  async getStock(
    @Param('sku') sku: string,
    @Query('warehouseId') warehouseId: string | undefined,
    @Headers(HttpHeaders.CorrelationId) correlationId?: string
  ) {
    if (!warehouseId?.trim()) {
      throw new BadRequestException('warehouseId query parameter is required')
    }

    const stock = await this.inventoryService.getStock(sku, warehouseId)

    return ok(stock, correlationId)
  }
}
