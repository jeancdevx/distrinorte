import { describe, expect, it } from 'vitest'

import { isValidOrderLine } from './order-line.js'

describe('isValidOrderLine', () => {
  it('accepts a valid line', () => {
    expect(isValidOrderLine({ sku: 'SKU-1', quantity: 2 })).toBe(true)
  })

  it('rejects empty sku', () => {
    expect(isValidOrderLine({ sku: '   ', quantity: 1 })).toBe(false)
  })

  it('rejects non-positive or non-integer quantity', () => {
    expect(isValidOrderLine({ sku: 'SKU-1', quantity: 0 })).toBe(false)
    expect(isValidOrderLine({ sku: 'SKU-1', quantity: 1.5 })).toBe(false)
  })
})
