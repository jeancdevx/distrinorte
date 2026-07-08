import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  PutCommand
} from '@aws-sdk/lib-dynamodb'

import { loadDemoProducts, type DemoProduct } from './lib/demo-data.js'
import {
  publishAvailabilityUpdated,
  publishCatalogPriceUpdated
} from './projection-events.js'

const BATCH_SIZE = 25

export async function seedDynamoDbProducts(): Promise<void> {
  const tableName = process.env.DYNAMODB_PRODUCTS_TABLE

  if (!tableName) {
    throw new Error('DYNAMODB_PRODUCTS_TABLE is required')
  }

  const region = process.env.AWS_REGION ?? 'us-east-2'
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
    marshallOptions: { removeUndefinedValues: true }
  })

  const { products } = loadDemoProducts()
  const items = products.map(product => toDynamoItem(product))

  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    const chunk = items.slice(index, index + BATCH_SIZE)

    await client.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: chunk.map(item => ({
            PutRequest: { Item: item }
          }))
        }
      })
    )
  }

  console.log(`DynamoDB: upserted ${items.length} products into ${tableName}`)

  for (const product of products) {
    await publishCatalogPriceUpdated({
      sku: product.sku,
      unitPriceNet: product.price,
      saleUnit: 'UN',
      unitsPerBaseUnit: 1,
      taxAffectation: 'GRAVADO',
      version: 1,
      correlationId: 'seed-demo'
    })
  }

  console.log(
    `EventBridge: published catalog.price_updated for ${products.length} products`
  )
}

function toDynamoItem(product: DemoProduct): Record<string, unknown> {
  return {
    sku: product.sku,
    name: product.name,
    price: product.price,
    unitPriceNet: product.price,
    saleUnit: 'UN',
    unitsPerBaseUnit: 1,
    taxAffectation: 'GRAVADO',
    category: product.category,
    imageKey: product.imageKey,
    ...(product.active === undefined ? {} : { active: product.active })
  }
}

export async function seedCatalogAvailabilityFromInventory(
  rows: Array<{ sku: string; warehouseId: string; quantity: number }>
): Promise<void> {
  const tableName = process.env.DYNAMODB_CATALOG_AVAILABILITY_TABLE

  if (!tableName) {
    console.log('Skip catalog_availability seed — table env not set')
    return
  }

  const region = process.env.AWS_REGION ?? 'us-east-2'
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region }))
  const asOf = new Date().toISOString()

  for (const row of rows) {
    const warehouseSku = `${row.warehouseId}#${row.sku}`

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          warehouseSku,
          warehouseId: row.warehouseId,
          sku: row.sku,
          availableQty: row.quantity,
          updatedAt: asOf
        }
      })
    )

    await publishAvailabilityUpdated({
      warehouseId: row.warehouseId,
      sku: row.sku,
      availableQty: row.quantity,
      asOf,
      correlationId: 'seed-demo'
    })
  }

  console.log(
    `catalog_availability: upserted ${rows.length} rows and published availability.updated`
  )
}
