import { Redis } from 'ioredis'

import { buildStockCacheKey, loadDemoProducts } from './lib/demo-data.js'

const STOCK_CACHE_TTL_SECONDS = 30

export async function warmRedisStock(): Promise<void> {
  const host = process.env.REDIS_HOST

  if (!host) {
    throw new Error('REDIS_HOST is required')
  }

  const redis = new Redis({
    host,
    port: Number.parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_AUTH_TOKEN || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    lazyConnect: true
  })

  await redis.connect()

  try {
    const { products } = loadDemoProducts()
    const pipeline = redis.pipeline()
    let keys = 0

    for (const product of products) {
      for (const [warehouseId, quantity] of Object.entries(product.stock)) {
        const key = buildStockCacheKey(product.sku, warehouseId)
        pipeline.set(key, String(quantity), 'EX', STOCK_CACHE_TTL_SECONDS)
        keys += 1
      }
    }

    await pipeline.exec()
    console.log(
      `Redis: warmed ${keys} stock keys (TTL ${STOCK_CACHE_TTL_SECONDS}s)`
    )
  } finally {
    redis.disconnect()
  }
}
