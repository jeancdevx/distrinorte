import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb'
import { Injectable } from '@nestjs/common'

import {
  isActiveProduct,
  parseProductItem,
  type ProductItem
} from './product-item.js'

@Injectable()
export class ProductsRepository {
  private readonly client: DynamoDBDocumentClient
  private readonly tableName: string
  private readonly categoryIndexName: string

  constructor() {
    this.client = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: process.env.AWS_REGION ?? 'us-east-2'
      })
    )
    this.tableName = process.env.DYNAMODB_PRODUCTS_TABLE ?? ''
    this.categoryIndexName =
      process.env.DYNAMODB_CATEGORY_GSI ?? 'category-index'

    if (!this.tableName) {
      throw new Error('DYNAMODB_PRODUCTS_TABLE is required')
    }
  }

  async listActiveProducts(category?: string): Promise<ProductItem[]> {
    if (category?.trim()) {
      return this.queryByCategory(category.trim())
    }

    return this.scanActiveProducts()
  }

  private async queryByCategory(category: string): Promise<ProductItem[]> {
    const response = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: this.categoryIndexName,
        KeyConditionExpression: '#category = :category',
        ExpressionAttributeNames: {
          '#category': 'category'
        },
        ExpressionAttributeValues: {
          ':category': category
        }
      })
    )

    return this.mapItems(response.Items ?? [])
  }

  private async scanActiveProducts(): Promise<ProductItem[]> {
    const products: ProductItem[] = []
    let lastEvaluatedKey: Record<string, unknown> | undefined

    do {
      const response = await this.client.send(
        new ScanCommand({
          TableName: this.tableName,
          ExclusiveStartKey: lastEvaluatedKey
        })
      )

      products.push(...this.mapItems(response.Items ?? []))
      lastEvaluatedKey = response.LastEvaluatedKey
    } while (lastEvaluatedKey)

    return products
  }

  private mapItems(items: Record<string, unknown>[]): ProductItem[] {
    return items
      .map(item => parseProductItem(item))
      .filter((item): item is ProductItem => item !== null)
      .filter(isActiveProduct)
  }
}
