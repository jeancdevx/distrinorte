import type { ChainableCommander, Redis } from 'ioredis'

import {
  buildStockCacheKey,
  resolveStockCacheTtlSeconds
} from '@distrinorte/shared'

export {
  buildStockCacheKey,
  resolveStockCacheTtlSeconds
} from '@distrinorte/shared'

export async function writeStockCacheQuantity(
  redis: Redis,
  sku: string,
  warehouseId: string,
  quantity: number
): Promise<void> {
  const key = buildStockCacheKey(sku, warehouseId)
  const value = String(quantity)
  const ttlSeconds = resolveStockCacheTtlSeconds()

  if (ttlSeconds) {
    await redis.set(key, value, 'EX', ttlSeconds)
    return
  }

  await redis.set(key, value)
}

export function queueStockCacheQuantity(
  pipeline: ChainableCommander,
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
