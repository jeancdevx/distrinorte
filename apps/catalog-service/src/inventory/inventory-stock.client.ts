import { Injectable, Logger } from '@nestjs/common'

type InventoryStockResponse = {
  data?: {
    quantity?: number
  }
}

@Injectable()
export class InventoryStockClient {
  private readonly logger = new Logger(InventoryStockClient.name)
  private readonly baseUrl: string

  constructor() {
    const baseUrl = process.env.INVENTORY_SERVICE_BASE_URL

    if (!baseUrl) {
      throw new Error('INVENTORY_SERVICE_BASE_URL is required')
    }

    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async getStock(sku: string, warehouseId: string): Promise<number> {
    const url = new URL(`${this.baseUrl}/stock/${encodeURIComponent(sku)}`)
    url.searchParams.set('warehouseId', warehouseId)

    try {
      const response = await fetch(url)

      if (!response.ok) {
        this.logger.warn(
          `Inventory stock lookup failed for ${sku}@${warehouseId}: HTTP ${response.status}`
        )
        return 0
      }

      const body = (await response.json()) as InventoryStockResponse
      const quantity = body.data?.quantity

      return typeof quantity === 'number' && quantity >= 0 ? quantity : 0
    } catch (error) {
      this.logger.warn(
        `Inventory stock lookup failed for ${sku}@${warehouseId}`,
        error instanceof Error ? error.message : String(error)
      )
      return 0
    }
  }
}
