import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'

import { loadDemoProducts, type DemoProduct } from './lib/demo-data.js'

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
}

function toDynamoItem(product: DemoProduct): Record<string, unknown> {
  return {
    sku: product.sku,
    name: product.name,
    price: product.price,
    category: product.category,
    imageKey: product.imageKey,
    ...(product.active === undefined ? {} : { active: product.active })
  }
}
