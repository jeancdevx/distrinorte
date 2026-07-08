import { defineProject } from 'vitest/config'

import { vitestUnitDefaults } from '@distrinorte/config/vitest.base'

export default defineProject({
  test: {
    ...vitestUnitDefaults,
    name: '@distrinorte/inventory-service'
  }
})
