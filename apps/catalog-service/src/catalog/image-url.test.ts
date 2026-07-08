import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildImageUrl } from './image-url.js'

describe('buildImageUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns a relative path when CATALOG_ASSETS_BASE_URL is unset', () => {
    vi.unstubAllEnvs()

    expect(buildImageUrl('/products/sku-1.jpg')).toBe('/products/sku-1.jpg')
  })

  it('normalizes base URL and image key slashes', () => {
    vi.stubEnv('CATALOG_ASSETS_BASE_URL', 'https://cdn.example.com/')

    expect(buildImageUrl('products/sku-1.jpg')).toBe(
      'https://cdn.example.com/products/sku-1.jpg'
    )
  })
})
