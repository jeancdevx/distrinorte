export function buildCatalogAvailabilityKey(
  warehouseId: string,
  sku: string
): string {
  return `${warehouseId}#${sku}`
}
