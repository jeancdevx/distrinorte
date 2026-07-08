import { describe, expect, it, vi } from 'vitest'

import type { OrderLineDetail } from '@distrinorte/events'

import { SourcingService } from './sourcing.service.js'

describe('SourcingService', () => {
  const service = new SourcingService()

  it('allocates local stock and transfers only the deficit', async () => {
    const stock = new Map<string, number>([
      ['COCA-600ML:chiclayo', 140],
      ['COCA-600ML:piura', 180]
    ])

    const lines: OrderLineDetail[] = [
      {
        sku: 'COCA-600ML',
        quantity: 180,
        unitPriceNet: 2.5,
        saleUnit: 'UN',
        unitsPerBaseUnit: 1,
        taxAffectation: 'GRAVADO',
        lineNet: 450,
        lineTax: 81,
        lineGross: 531
      }
    ]

    const result = await service.planOrder(
      'chiclayo',
      lines,
      async (sku, warehouseId) => stock.get(`${sku}:${warehouseId}`) ?? 0
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const [line] = result.plan.lines
    expect(line?.localBase).toBe(140)
    expect(line?.requiredBase).toBe(180)
    expect(line?.transfers).toEqual([
      { fromWarehouseId: 'piura', quantityBase: 40 }
    ])
  })

  it('rejects when network stock is insufficient', async () => {
    const loadAvailable = vi.fn(async () => 10)

    const result = await service.planOrder(
      'chiclayo',
      [
        {
          sku: 'COCA-600ML',
          quantity: 100,
          unitPriceNet: 2.5,
          saleUnit: 'UN',
          unitsPerBaseUnit: 1,
          taxAffectation: 'GRAVADO',
          lineNet: 250,
          lineTax: 45,
          lineGross: 295
        }
      ],
      loadAvailable
    )

    expect(result.ok).toBe(false)
  })
})
