import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const bundlePath = path.join(packageRoot, '../dist/index.mjs')

const source = readFileSync(bundlePath, 'utf8')

const banned = [
  /from\s*["']@distrinorte\//,
  /import\s*\(\s*["']@distrinorte\//,
  /from\s*["']@aws-sdk\//,
  /import\s*\(\s*["']@aws-sdk\//
]

const hits = banned.flatMap((pattern) => {
  const match = source.match(pattern)
  return match ? [match[0]] : []
})

if (hits.length > 0) {
  console.error(
    `Lambda bundle still contains external imports (must be fully bundled):\n- ${hits.join('\n- ')}`
  )
  console.error(
    'Build @distrinorte/events first, then re-run package:lambda.'
  )
  process.exit(1)
}

console.log('Lambda bundle assert ok:', bundlePath)
