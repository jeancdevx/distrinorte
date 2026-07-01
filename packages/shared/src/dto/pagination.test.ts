import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  normalizePagination,
  toPaginatedResult
} from './pagination.js'

describe('normalizePagination', () => {
  it('applies defaults for missing query values', () => {
    expect(normalizePagination({})).toEqual({
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      skip: 0
    })
  })

  it('computes skip from page and limit', () => {
    expect(normalizePagination({ page: 3, limit: 10 })).toEqual({
      page: 3,
      limit: 10,
      skip: 20
    })
  })

  it('caps limit at MAX_LIMIT', () => {
    expect(normalizePagination({ limit: 500 }).limit).toBe(MAX_LIMIT)
  })

  it('ignores non-positive page values', () => {
    expect(normalizePagination({ page: 0, limit: 5 }).page).toBe(DEFAULT_PAGE)
  })
})

describe('toPaginatedResult', () => {
  it('builds pagination metadata', () => {
    expect(toPaginatedResult(['a', 'b'], 25, 2, 10)).toEqual({
      items: ['a', 'b'],
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3
    })
  })

  it('returns zero total pages when total is zero', () => {
    expect(toPaginatedResult([], 0, 1, 20).totalPages).toBe(0)
  })
})
