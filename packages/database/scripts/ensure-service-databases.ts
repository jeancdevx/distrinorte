import pg from 'pg'

import {
  SERVICE_DATABASE_NAMES,
  resolveAdminDatabaseUrl,
  type DatabaseDomain
} from '../src/database-url.js'

const SERVICE_DATABASE_LIST = Object.values(SERVICE_DATABASE_NAMES) as string[]

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`
}

export async function ensureServiceDatabases(
  databases: string[] = SERVICE_DATABASE_LIST
): Promise<void> {
  const client = new pg.Client({
    connectionString: resolveAdminDatabaseUrl()
  })

  await client.connect()

  try {
    for (const database of databases) {
      const exists = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [database]
      )

      if (exists.rowCount === 0) {
        await client.query(`CREATE DATABASE ${quoteIdent(database)}`)
        console.log(`created database: ${database}`)
      } else {
        console.log(`database exists: ${database}`)
      }
    }
  } finally {
    await client.end()
  }
}

export function databaseNameForDomain(domain: DatabaseDomain): string {
  return SERVICE_DATABASE_NAMES[domain]
}

async function main(): Promise<void> {
  await ensureServiceDatabases()
}

main().catch(error => {
  console.error('ensure-service-databases failed', error)
  process.exit(1)
})
