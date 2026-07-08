export type FulfillmentOrigin = {
  warehouseId: string
  sku: string
  quantityBase: number
}

export type TransferMatrixEntry = {
  fromWarehouseId: string
  toWarehouseId: string
  businessDays: number
  cutoffHour?: number
}

const DEFAULT_CUTOFF_HOUR = 14
const LOCAL_PREP_DAYS = 1

export function calculateTransferDays(
  destinationWarehouseId: string,
  fulfillment: FulfillmentOrigin[],
  matrix: TransferMatrixEntry[],
  confirmedAt: Date
): number {
  let transferDays = 0

  for (const item of fulfillment) {
    if (item.warehouseId === destinationWarehouseId) {
      continue
    }

    const entry = matrix.find(
      row =>
        row.fromWarehouseId === item.warehouseId &&
        row.toWarehouseId === destinationWarehouseId
    )

    if (entry) {
      transferDays = Math.max(transferDays, entry.businessDays)
    }
  }

  const cutoffHour =
    matrix.find(row => row.toWarehouseId === destinationWarehouseId)
      ?.cutoffHour ?? DEFAULT_CUTOFF_HOUR

  const hour = confirmedAt.getHours()
  if (hour >= cutoffHour) {
    transferDays += 1
  }

  return transferDays
}

export function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start)
  let remaining = days

  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    if (day !== 0 && day !== 6) {
      remaining -= 1
    }
  }

  return result
}

export function calculateEstimatedDeliveryDate(
  destinationWarehouseId: string,
  fulfillment: FulfillmentOrigin[],
  matrix: TransferMatrixEntry[],
  confirmedAt: Date
): Date {
  const transferDays = calculateTransferDays(
    destinationWarehouseId,
    fulfillment,
    matrix,
    confirmedAt
  )

  return addBusinessDays(confirmedAt, transferDays + LOCAL_PREP_DAYS)
}
