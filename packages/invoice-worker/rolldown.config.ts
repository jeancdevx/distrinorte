import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'rolldown'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  input: 'src/handler.ts',
  platform: 'node',
  external: id => id.startsWith('node:') || id === 'aws-lambda',
  onwarn(warning, defaultHandler) {
    if (warning.code === 'UNRESOLVED_IMPORT') {
      throw new Error(
        `Unresolved import "${warning.exporter}" in ${warning.id ?? 'unknown'}. Build workspace packages before packaging the Lambda.`
      )
    }
    defaultHandler(warning)
  },
  output: {
    codeSplitting: false,
    file: path.join(packageRoot, 'dist/index.mjs'),
    format: 'esm',
    minify: true
  }
})
