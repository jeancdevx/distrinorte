import { describe, expect, it } from 'vitest'

import { parseCreateOrderInput } from './create-order.dto.js'

describe('parseCreateOrderInput', () => {
  it('parses a valid order payload', () => {
    expect(
      parseCreateOrderInput({
        warehouseId: ' wh-norte ',
        lines: [{ sku: 'SKU-1', quantity: 2 }]
      })
    ).toEqual({
      warehouseId: 'wh-norte',
      lines: [{ sku: 'SKU-1', quantity: 2 }]
    })
  })

  it('rejects invalid bodies', () => {
    expect(() => parseCreateOrderInput(null)).toThrow('INVALID_BODY')
    expect(() => parseCreateOrderInput({ warehouseId: 'wh-1' })).toThrow(
      'INVALID_LINES'
    )
    expect(() =>
      parseCreateOrderInput({
        warehouseId: 'wh-1',
        lines: [{ sku: 'SKU-1', quantity: 0 }]
      })
    ).toThrow('INVALID_QUANTITY')
  })
})
