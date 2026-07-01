import { describe, expect, it } from 'vitest'

import { OrderStatus } from '@distrinorte/database'

import { parseListOrdersQuery } from './list-orders.dto.js'

describe('parseListOrdersQuery', () => {
  it('returns empty filters when status is omitted', () => {
    expect(parseListOrdersQuery({})).toEqual({})
    expect(parseListOrdersQuery({ status: '' })).toEqual({})
  })

  it('parses a valid order status', () => {
    expect(parseListOrdersQuery({ status: OrderStatus.PENDING })).toEqual({
      status: OrderStatus.PENDING
    })
  })

  it('rejects invalid status values', () => {
    expect(() => parseListOrdersQuery({ status: 'UNKNOWN' })).toThrow(
      'INVALID_STATUS'
    )
    expect(() => parseListOrdersQuery({ status: 123 })).toThrow(
      'INVALID_STATUS'
    )
  })
})
