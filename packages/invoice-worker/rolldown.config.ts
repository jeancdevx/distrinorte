import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'rolldown'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  input: 'src/handler.ts',
  platform: 'node',
  external: [],
  output: {
    codeSplitting: false,
    file: path.join(packageRoot, 'dist/index.mjs'),
    format: 'esm',
    minify: true
  }
})
