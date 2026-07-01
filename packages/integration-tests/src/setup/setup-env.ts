import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const statePath = join(
  dirname(fileURLToPath(import.meta.url)),
  '.integration-env.json'
)

if (existsSync(statePath)) {
  const state = JSON.parse(readFileSync(statePath, 'utf8')) as Record<
    string,
    string
  >

  for (const [key, value] of Object.entries(state)) {
    process.env[key] = value
  }
}
