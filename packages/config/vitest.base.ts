import type { ViteUserConfig } from 'vitest/config'

export const vitestUnitDefaults: NonNullable<ViteUserConfig['test']> = {
  environment: 'node',
  include: ['src/**/*.test.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov', 'html'],
    include: ['src/**/*.ts'],
    exclude: [
      'src/**/*.test.ts',
      'src/**/index.ts',
      'src/main.ts',
      'src/**/*.module.ts'
    ]
  }
}
