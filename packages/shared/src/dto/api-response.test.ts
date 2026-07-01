import { describe, expect, it } from 'vitest'

import { fail, ok } from './api-response.js'

describe('api-response helpers', () => {
  it('wraps success payloads', () => {
    expect(ok({ id: '1' })).toEqual({ data: { id: '1' } })
    expect(ok({ id: '1' }, 'corr-1')).toEqual({
      data: { id: '1' },
      correlationId: 'corr-1'
    })
  })

  it('wraps error payloads', () => {
    expect(fail('NOT_FOUND', 'missing')).toEqual({
      error: { code: 'NOT_FOUND', message: 'missing' }
    })
    expect(fail('NOT_FOUND', 'missing', 'corr-2')).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'missing',
        correlationId: 'corr-2'
      }
    })
  })
})
