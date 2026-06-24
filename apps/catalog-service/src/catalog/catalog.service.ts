import { BadRequestException, Injectable, Logger } from '@nestjs/common'

import { buildStockCacheKey } from '@distrinorte/shared'

import { ProductsRepository } from '../dynamodb/products.repository.js'
import { RedisService } from '../redis/redis.service.js'
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
  private readonly logger = new Logger(CatalogService.name)

  constructor(
    private readonly products: ProductsRepository,
    private readonly redis: RedisService
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

    return products.map((product, index) => {
      const cachedStock = stockValues[index]
      const stock = resolveCatalogStock(
        product.sku,
        warehouseId,
        cachedStock,
        this.logger
      )

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
  }
}

function resolveCatalogStock(
  sku: string,
  warehouseId: string,
  cachedStock: string | null,
  logger: Logger
): number {
  if (cachedStock === null) {
    logger.error(
      `Stock cache miss for catalog listing (sku=${sku}, warehouseId=${warehouseId})`
    )
    return 0
  }

  return parseStockQuantity(cachedStock)
}

function parseStockQuantity(value: string): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}
