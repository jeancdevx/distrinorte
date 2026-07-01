import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  PutCommand
} from '@aws-sdk/lib-dynamodb'
import { Injectable } from '@nestjs/common'

import { buildCatalogAvailabilityKey } from './availability-key.js'

export type CatalogAvailabilityItem = {
  warehouseSku: string
  warehouseId: string
  sku: string
  availableQty: number
  updatedAt: string
}

@Injectable()
export class AvailabilityRepository {
  private readonly client: DynamoDBDocumentClient
  private readonly tableName: string

  constructor() {
    this.client = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: process.env.AWS_REGION ?? 'us-east-2'
      })
    )
    this.tableName = process.env.DYNAMODB_CATALOG_AVAILABILITY_TABLE ?? ''

    if (!this.tableName) {
      throw new Error('DYNAMODB_CATALOG_AVAILABILITY_TABLE is required')
    }
  }

  async upsertAvailability(
    warehouseId: string,
    sku: string,
    availableQty: number,
    asOf: string
  ): Promise<void> {
    const warehouseSku = buildCatalogAvailabilityKey(warehouseId, sku)

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          warehouseSku,
          warehouseId,
          sku,
          availableQty,
          updatedAt: asOf
        }
      })
    )
  }

  async batchGetAvailability(
    warehouseId: string,
    skus: string[]
  ): Promise<Map<string, number>> {
    if (skus.length === 0) {
      return new Map()
    }

    const keys = skus.map(sku => ({
      warehouseSku: buildCatalogAvailabilityKey(warehouseId, sku)
    }))

    const response = await this.client.send(
      new BatchGetCommand({
        RequestItems: {
          [this.tableName]: {
            Keys: keys
          }
        }
      })
    )

    const items = response.Responses?.[this.tableName] ?? []
    const stockBySku = new Map<string, number>()

    for (const item of items) {
      const record = item as CatalogAvailabilityItem
      stockBySku.set(record.sku, record.availableQty)
    }

    return stockBySku
  }
}
