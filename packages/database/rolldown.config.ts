import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'rolldown'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  input: 'src/index.ts',
  platform: 'node',
  external: ['pg', '@prisma/adapter-pg'],
  plugins: [
    {
      name: 'resolve-generated-client',
      resolveId(source) {
        if (source === '../generated/client.js') {
          return path.join(packageRoot, 'generated/client.ts')
        }

        return null
      }
    }
  ],
  output: {
    dir: 'dist',
    format: 'esm'
  }
})
