import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'rolldown'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))

const generatedClientImports = [
  '../generated/customers/client.js',
  '../generated/orders/client.js',
  '../generated/inventory/client.js'
] as const

export default defineConfig({
  input: {
    index: 'src/index.ts',
    customers: 'src/customers.ts',
    orders: 'src/orders.ts',
    inventory: 'src/inventory.ts'
  },
  platform: 'node',
  external: ['pg', '@prisma/adapter-pg', ...generatedClientImports],
  plugins: [
    {
      name: 'resolve-generated-clients',
      resolveId(source) {
        if (
          !generatedClientImports.includes(
            source as (typeof generatedClientImports)[number]
          )
        ) {
          return null
        }

        const relativePath = source.replace('../', '').replace(/\.js$/, '.ts')
        return path.join(packageRoot, relativePath)
      }
    }
  ],
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name].js'
  }
})
