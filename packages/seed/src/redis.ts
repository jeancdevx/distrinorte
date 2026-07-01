import { Redis } from 'ioredis'

import { createInventoryPrismaClient } from '@distrinorte/database/inventory'
import {
  buildStockCacheKey,
  resolveStockCacheTtlSeconds
} from '@distrinorte/shared'

import { seedCatalogAvailabilityFromInventory } from './dynamodb.js'

function queueStockCacheQuantity(
  pipeline: ReturnType<Redis['pipeline']>,
  sku: string,
  warehouseId: string,
  quantity: number
): void {
  const key = buildStockCacheKey(sku, warehouseId)
  const value = String(quantity)
  const ttlSeconds = resolveStockCacheTtlSeconds()

  if (ttlSeconds) {
    pipeline.set(key, value, 'EX', ttlSeconds)
    return
  }

  pipeline.set(key, value)
}

export async function warmRedisStockFromRds(): Promise<void> {
  const host = process.env.REDIS_HOST

  if (!host) {
    throw new Error('REDIS_HOST is required')
  }

  const prisma = createInventoryPrismaClient()
  const redis = new Redis({
    host,
    port: Number.parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_AUTH_TOKEN || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    lazyConnect: true
  })

  await redis.connect()

  try {
    const rows = await prisma.inventory.findMany({
      select: { sku: true, warehouseId: true, quantity: true }
    })

    if (rows.length === 0) {
      throw new Error('No inventory rows found in RDS — run db:seed first')
    }

    const pipeline = redis.pipeline()

    for (const row of rows) {
      queueStockCacheQuantity(pipeline, row.sku, row.warehouseId, row.quantity)
    }

    await pipeline.exec()
    await seedCatalogAvailabilityFromInventory(rows)

    const ttlSeconds = resolveStockCacheTtlSeconds()
    const ttlLabel =
      ttlSeconds === undefined ? 'no expiry' : `TTL ${ttlSeconds}s`

    console.log(
      `Redis: warmed ${rows.length} stock keys from inventory_db (${ttlLabel})`
    )
  } finally {
    await prisma.$disconnect()
    redis.disconnect()
  }
}
