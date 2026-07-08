import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'rolldown'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  input: 'src/handler.ts',
  platform: 'node',
  external: [
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/client-eventbridge',
    '@aws-sdk/client-s3',
    '@aws-sdk/lib-dynamodb'
  ],
  output: {
    file: path.join(packageRoot, 'dist/index.js'),
    format: 'esm',
    minify: true
  }
})
