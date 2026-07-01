import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineProject } from 'vitest/config'

import { vitestUnitDefaults } from '@distrinorte/config/vitest.base'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineProject({
  test: {
    ...vitestUnitDefaults,
    name: '@distrinorte/events'
  },
  resolve: {
    alias: {
      '@': resolve(rootDir, './src')
    }
  }
})
