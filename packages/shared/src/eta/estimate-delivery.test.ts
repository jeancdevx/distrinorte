import { describe, expect, it } from 'vitest'

import {
  addBusinessDays,
  calculateEstimatedDeliveryDate,
  calculateTransferDays
} from './estimate-delivery.js'

describe('estimate-delivery', () => {
  const matrix = [
    {
      fromWarehouseId: 'trujillo',
      toWarehouseId: 'chiclayo',
      businessDays: 1,
      cutoffHour: 14
    }
  ]

  it('adds an extra day after the cutoff hour', () => {
    const confirmedAt = new Date('2026-06-17T15:30:00-05:00')
    const transferDays = calculateTransferDays(
      'chiclayo',
      [{ warehouseId: 'trujillo', sku: 'SKU-1', quantityBase: 10 }],
      matrix,
      confirmedAt
    )

    expect(transferDays).toBe(2)
  })

  it('computes ETA with local prep days', () => {
    const confirmedAt = new Date('2026-06-17T10:00:00-05:00')
    const eta = calculateEstimatedDeliveryDate(
      'chiclayo',
      [{ warehouseId: 'trujillo', sku: 'SKU-1', quantityBase: 10 }],
      matrix,
      confirmedAt
    )

    expect(addBusinessDays(confirmedAt, 2).toDateString()).toBe(
      eta.toDateString()
    )
  })
})
