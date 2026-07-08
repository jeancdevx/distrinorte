import { BadRequestException, Injectable, Logger } from '@nestjs/common'

import { AvailabilityRepository } from '../dynamodb/availability.repository.js'
import { ProductsRepository } from '../dynamodb/products.repository.js'
import { buildImageUrl } from './image-url.js'

export type CatalogProduct = {
  sku: string
  name: string
  price: number
  unitPriceNet: number
  saleUnit: string
  unitsPerBaseUnit: number
  taxAffectation: string
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
    private readonly availability: AvailabilityRepository
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
    const items = await this.enrichWithAvailability(
      pageItems,
      normalizedWarehouseId
    )

    return { items, total }
  }

  private async enrichWithAvailability(
    products: Array<{
      sku: string
      name: string
      price: number
      unitPriceNet: number
      saleUnit: string
      unitsPerBaseUnit: number
      taxAffectation: string
      category: string
      imageKey: string
    }>,
    warehouseId: string
  ): Promise<CatalogProduct[]> {
    if (products.length === 0) {
      return []
    }

    const stockBySku = await this.availability.batchGetAvailability(
      warehouseId,
      products.map(product => product.sku)
    )

    return products.map(product => {
      const stock = stockBySku.get(product.sku)

      if (stock === undefined) {
        this.logger.warn(
          `Availability read model miss (sku=${product.sku}, warehouseId=${warehouseId})`
        )
      }

      return {
        sku: product.sku,
        name: product.name,
        price: product.unitPriceNet,
        unitPriceNet: product.unitPriceNet,
        saleUnit: product.saleUnit,
        unitsPerBaseUnit: product.unitsPerBaseUnit,
        taxAffectation: product.taxAffectation,
        category: product.category,
        imageKey: product.imageKey,
        imageUrl: buildImageUrl(product.imageKey),
        stock: stock ?? 0
      }
    })
  }
}
