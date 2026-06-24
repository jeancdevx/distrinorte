export const STOCK_CACHE_TTL_ENV = 'STOCK_CACHE_TTL_SECONDS'
export const STOCK_CACHE_RECONCILE_INTERVAL_ENV =
  'STOCK_CACHE_RECONCILE_INTERVAL_SECONDS'

const DEFAULT_RECONCILE_INTERVAL_SECONDS = 3600

export function buildStockCacheKey(sku: string, warehouseId: string): string {
  return `stock:${sku}:${warehouseId}`
}

export function resolveStockCacheTtlSeconds(): number | undefined {
  const raw = process.env[STOCK_CACHE_TTL_ENV]

  if (raw === undefined || raw === '') {
    return undefined
  }

  const parsed = Number.parseInt(raw, 10)

  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined
  }

  return parsed
}

export function resolveStockCacheReconcileIntervalSeconds():
  | number
  | undefined {
  const raw = process.env[STOCK_CACHE_RECONCILE_INTERVAL_ENV]

  if (raw === undefined || raw === '') {
    return DEFAULT_RECONCILE_INTERVAL_SECONDS
  }

  const parsed = Number.parseInt(raw, 10)

  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined
  }

  return parsed
}
