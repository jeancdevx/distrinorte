import { describe, expect, it } from 'vitest'

import {
  calculateLineAmounts,
  calculateOrderTotals,
  isMinimumOrderMet
} from './calculate.js'

describe('pricing', () => {
  it('calculates taxed and exempt lines', () => {
    const taxed = calculateLineAmounts({
      quantity: 10,
      unitPriceNet: 25,
      unitsPerBaseUnit: 1,
      taxAffectation: 'GRAVADO'
    })
    const exempt = calculateLineAmounts({
      quantity: 5,
      unitPriceNet: 18,
      unitsPerBaseUnit: 1,
      taxAffectation: 'EXONERADO'
    })

    expect(taxed).toEqual({
      quantityBase: 10,
      lineNet: 250,
      lineTax: 45,
      lineGross: 295
    })
    expect(exempt.lineTax).toBe(0)

    const totals = calculateOrderTotals([taxed, exempt])
    expect(totals).toEqual({
      totalNet: 340,
      totalTax: 45,
      totalGross: 385
    })
    expect(isMinimumOrderMet(totals.totalGross)).toBe(true)
  })

  it('rejects orders below the minimum gross', () => {
    expect(isMinimumOrderMet(199.99)).toBe(false)
    expect(isMinimumOrderMet(200)).toBe(true)
  })
})
