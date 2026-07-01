import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: '@distrinorte/integration-tests',
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    globalSetup: ['./src/setup/global-setup.ts'],
    setupFiles: ['./src/setup/setup-env.ts'],
    hookTimeout: 120_000,
    testTimeout: 60_000,
    fileParallelism: false
  }
})
