import { describe, expect, it } from 'vitest'

import { createCorrelationId, resolveCorrelationId } from './correlation-id.js'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('resolveCorrelationId', () => {
  it('returns trimmed header value when present', () => {
    expect(resolveCorrelationId('  abc-123  ')).toBe('abc-123')
  })

  it('uses first non-empty value from header array', () => {
    expect(resolveCorrelationId(['', '  corr-1  '])).toBe('corr-1')
  })

  it('generates a UUID when header is missing', () => {
    expect(resolveCorrelationId(undefined)).toMatch(UUID_RE)
    expect(createCorrelationId()).toMatch(UUID_RE)
  })
})
