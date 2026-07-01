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
    .withDatabase('postgres')
    .withUsername('test')
    .withPassword('test')
    .start()

  const host = container.getHost()
  const port = container.getMappedPort(5432)

  writeFileSync(
    statePath,
    JSON.stringify({
      DATABASE_HOST: host,
      DATABASE_PORT: String(port),
      DATABASE_USER: 'test',
      DATABASE_PASSWORD: 'test',
      DATABASE_ADMIN_NAME: 'postgres',
      DATABASE_NAME_CUSTOMERS: 'customers_db',
      DATABASE_NAME_ORDERS: 'orders_db',
      DATABASE_NAME_INVENTORY: 'inventory_db'
    })
  )

  const env = {
    ...process.env,
    DATABASE_HOST: host,
    DATABASE_PORT: String(port),
    DATABASE_USER: 'test',
    DATABASE_PASSWORD: 'test',
    DATABASE_ADMIN_NAME: 'postgres',
    DATABASE_NAME_CUSTOMERS: 'customers_db',
    DATABASE_NAME_ORDERS: 'orders_db',
    DATABASE_NAME_INVENTORY: 'inventory_db'
  }

  execFileSync('pnpm', ['db:ensure-databases'], {
    cwd: databasePackageDir,
    env,
    stdio: 'inherit'
  })

  execFileSync('pnpm', ['db:migrate:deploy'], {
    cwd: databasePackageDir,
    env,
    stdio: 'inherit'
  })

  return async () => {
    await container.stop()
  }
}
