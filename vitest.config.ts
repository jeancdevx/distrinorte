import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/shared',
      'packages/events',
      'apps/orders-service',
      'apps/customers-service',
      'apps/catalog-service',
      'packages/integration-tests'
    ]
  }
})
