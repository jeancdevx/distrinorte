export const STOCK_CACHE_TTL_SECONDS = 30

export function buildStockCacheKey(sku: string, warehouseId: string): string {
  return `stock:${sku}:${warehouseId}`
}
