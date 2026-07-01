import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PostgreSqlContainer } from '@testcontainers/postgresql'

const setupDir = dirname(fileURLToPath(import.meta.url))
const statePath = join(setupDir, '.integration-env.json')
const databasePackageDir = join(setupDir, '../../../database')

export default async function globalSetup(): Promise<() => Promise<void>> {
  const container = await new PostgreSqlContainer('postgres:17-alpine')
    .withDatabase('distrinorte_test')
    .withUsername('test')
    .withPassword('test')
    .start()

  const databaseUrl = container.getConnectionUri()

  writeFileSync(statePath, JSON.stringify({ DATABASE_URL: databaseUrl }))

  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: databasePackageDir,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl
    },
    stdio: 'inherit'
  })

  return async () => {
    await container.stop()
  }
}
