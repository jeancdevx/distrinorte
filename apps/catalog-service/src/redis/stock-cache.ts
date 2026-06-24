export function buildStockCacheKey(sku: string, warehouseId: string): string {
  return `stock:${sku}:${warehouseId}`
}
