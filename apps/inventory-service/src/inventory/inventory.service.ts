import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'

import { buildStockCacheKey } from '@distrinorte/shared'

import { PrismaService } from '../database/prisma.service.js'
import { RedisService } from '../redis/redis.service.js'
import { writeStockCacheQuantity } from '../redis/stock-cache.js'

export type StockRecord = {
  sku: string
  warehouseId: string
  quantity: number
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async getStock(sku: string, warehouseId: string): Promise<StockRecord> {
    const normalizedSku = sku.trim()
    const normalizedWarehouseId = warehouseId.trim()

    if (!normalizedSku || !normalizedWarehouseId) {
      throw new BadRequestException('sku and warehouseId are required')
    }

    const cacheKey = buildStockCacheKey(normalizedSku, normalizedWarehouseId)
    const cached = await this.redis.client.get(cacheKey)

    if (cached !== null) {
      return {
        sku: normalizedSku,
        warehouseId: normalizedWarehouseId,
        quantity: Number.parseInt(cached, 10)
      }
    }

    const inventory = await this.prisma.db.inventory.findUnique({
      where: {
        sku_warehouseId: {
          sku: normalizedSku,
          warehouseId: normalizedWarehouseId
        }
      }
    })

    if (!inventory) {
      throw new NotFoundException('Stock not found')
    }

    await writeStockCacheQuantity(
      this.redis.client,
      inventory.sku,
      inventory.warehouseId,
      inventory.quantity
    )

    return {
      sku: inventory.sku,
      warehouseId: inventory.warehouseId,
      quantity: inventory.quantity
    }
  }

  async setStockCache(
    sku: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    await writeStockCacheQuantity(this.redis.client, sku, warehouseId, quantity)
  }

  async getStockFromDatabase(
    sku: string,
    warehouseId: string
  ): Promise<number | null> {
    const inventory = await this.prisma.db.inventory.findUnique({
      where: {
        sku_warehouseId: {
          sku,
          warehouseId
        }
      },
      select: { quantity: true }
    })

    return inventory?.quantity ?? null
  }
}
