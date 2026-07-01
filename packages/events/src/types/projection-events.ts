export type CustomerRegisteredEvent = {
  customerId: string
  taxId: string
  assignedWarehouseId: string
  status: string
  correlationId: string
}

export type CustomerUpdatedEvent = {
  customerId: string
  taxId?: string
  assignedWarehouseId?: string
  status?: string
  correlationId: string
}

export type CatalogPriceUpdatedEvent = {
  sku: string
  unitPriceNet: number
  saleUnit: string
  unitsPerBaseUnit: number
  taxAffectation: string
  version: number
  correlationId: string
}

export type AvailabilityUpdatedEvent = {
  warehouseId: string
  sku: string
  availableQty: number
  asOf: string
  correlationId: string
}
