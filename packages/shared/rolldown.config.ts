import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'rolldown'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  input: 'src/index.ts',
  platform: 'node',
  external: ['@nestjs/common', 'rxjs'],
  plugins: [
    {
      name: 'ts-path-at-alias',
      resolveId(source) {
        if (!source.startsWith('@/')) {
          return null
        }

        let relativePath = source.slice(2)
        if (relativePath.endsWith('.js')) {
          relativePath = `${relativePath.slice(0, -3)}.ts`
        }

        return path.join(packageRoot, 'src', relativePath)
      }
    }
  ],
  output: {
    dir: 'dist',
    format: 'esm'
  }
})
