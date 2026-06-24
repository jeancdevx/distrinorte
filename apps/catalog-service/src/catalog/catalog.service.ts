import { BadRequestException, Injectable } from '@nestjs/common'

import { ProductsRepository } from '../dynamodb/products.repository.js'
import { InventoryStockClient } from '../inventory/inventory-stock.client.js'
import { RedisService } from '../redis/redis.service.js'
import { buildStockCacheKey } from '../redis/stock-cache.js'
import { buildImageUrl } from './image-url.js'

export type CatalogProduct = {
  sku: string
  name: string
  price: number
  category: string
  imageKey: string
  imageUrl: string
  stock: number
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly products: ProductsRepository,
    private readonly redis: RedisService,
    private readonly inventory: InventoryStockClient
  ) {}

  async listProducts(
    warehouseId: string,
    category: string | undefined,
    skip: number,
    limit: number
  ): Promise<{ items: CatalogProduct[]; total: number }> {
    const normalizedWarehouseId = warehouseId.trim()

    if (!normalizedWarehouseId) {
      throw new BadRequestException('warehouseId is required')
    }

    const products = await this.products.listActiveProducts(category)
    const total = products.length
    const pageItems = products.slice(skip, skip + limit)
    const items = await this.enrichWithStock(pageItems, normalizedWarehouseId)

    return { items, total }
  }

  private async enrichWithStock(
    products: Array<{
      sku: string
      name: string
      price: number
      category: string
      imageKey: string
    }>,
    warehouseId: string
  ): Promise<CatalogProduct[]> {
    if (products.length === 0) {
      return []
    }

    const keys = products.map(product =>
      buildStockCacheKey(product.sku, warehouseId)
    )
    const stockValues = await this.redis.client.mget(...keys)

    return Promise.all(
      products.map(async (product, index) => {
        let stock = parseStockQuantity(stockValues[index])

        if (stockValues[index] === null) {
          stock = await this.inventory.getStock(product.sku, warehouseId)
        }

        return {
          sku: product.sku,
          name: product.name,
          price: product.price,
          category: product.category,
          imageKey: product.imageKey,
          imageUrl: buildImageUrl(product.imageKey),
          stock
        }
      })
    )
  }
}

function parseStockQuantity(value: string | null): number {
  if (value === null) {
    return 0
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}
