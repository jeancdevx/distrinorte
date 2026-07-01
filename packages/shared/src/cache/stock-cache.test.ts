import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  STOCK_CACHE_RECONCILE_INTERVAL_ENV,
  STOCK_CACHE_TTL_ENV,
  buildStockCacheKey,
  resolveStockCacheReconcileIntervalSeconds,
  resolveStockCacheTtlSeconds
} from './stock-cache.js'

describe('buildStockCacheKey', () => {
  it('builds a namespaced key from sku and warehouse', () => {
    expect(buildStockCacheKey('SKU-1', 'wh-norte')).toBe('stock:SKU-1:wh-norte')
  })
})

describe('resolveStockCacheTtlSeconds', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns undefined when env is unset', () => {
    vi.stubEnv(STOCK_CACHE_TTL_ENV, '')

    expect(resolveStockCacheTtlSeconds()).toBeUndefined()
  })

  it('parses a positive integer TTL', () => {
    vi.stubEnv(STOCK_CACHE_TTL_ENV, '300')

    expect(resolveStockCacheTtlSeconds()).toBe(300)
  })

  it('returns undefined for invalid values', () => {
    vi.stubEnv(STOCK_CACHE_TTL_ENV, '0')
    expect(resolveStockCacheTtlSeconds()).toBeUndefined()

    vi.stubEnv(STOCK_CACHE_TTL_ENV, 'abc')
    expect(resolveStockCacheTtlSeconds()).toBeUndefined()
  })
})

describe('resolveStockCacheReconcileIntervalSeconds', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('defaults to one hour when env is unset', () => {
    vi.stubEnv(STOCK_CACHE_RECONCILE_INTERVAL_ENV, '')

    expect(resolveStockCacheReconcileIntervalSeconds()).toBe(3600)
  })

  it('parses a custom reconcile interval', () => {
    vi.stubEnv(STOCK_CACHE_RECONCILE_INTERVAL_ENV, '120')

    expect(resolveStockCacheReconcileIntervalSeconds()).toBe(120)
  })

  it('returns undefined for invalid values', () => {
    vi.stubEnv(STOCK_CACHE_RECONCILE_INTERVAL_ENV, '-1')

    expect(resolveStockCacheReconcileIntervalSeconds()).toBeUndefined()
  })
})
