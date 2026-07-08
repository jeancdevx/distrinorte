import { describe, expect, it } from 'vitest'

import { parseCreateOrderInput } from './create-order.dto.js'

describe('parseCreateOrderInput', () => {
  it('parses a valid order payload', () => {
    expect(
      parseCreateOrderInput({
        lines: [{ sku: 'SKU-1', quantity: 2 }]
      })
    ).toEqual({
      lines: [{ sku: 'SKU-1', quantity: 2 }]
    })
  })

  it('rejects invalid bodies', () => {
    expect(() => parseCreateOrderInput(null)).toThrow('INVALID_BODY')
    expect(() => parseCreateOrderInput({})).toThrow('INVALID_LINES')
    expect(() =>
      parseCreateOrderInput({
        lines: [{ sku: 'SKU-1', quantity: 0 }]
      })
    ).toThrow('INVALID_QUANTITY')
  })
})
