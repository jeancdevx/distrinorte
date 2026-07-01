import pg from 'pg'

import {
  SERVICE_DATABASE_NAMES,
  resolveAdminDatabaseUrl,
  resolveDatabaseUrl
} from '../src/database-url.js'

const LEGACY_DATABASE = process.env.LEGACY_DATABASE_NAME ?? 'distrinorte'

const LEGACY_SCHEMA_TABLES = [
  'customers',
  'accounts',
  'orders',
  'order_lines',
  'inventory',
  'reservations'
] as const

async function legacySchemaExists(client: pg.Client): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'customers'
    ) AS exists`
  )

  return result.rows[0]?.exists === true
}

async function copyTable(
  source: pg.Client,
  target: pg.Client,
  table: string,
  columns: string
): Promise<number> {
  const sourceExists = await source.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
    ) AS exists`,
    [table]
  )

  if (!sourceExists.rows[0]?.exists) {
    console.log(`legacy.${table}: source table not found — skipping`)
    return 0
  }

  const targetExists = await target.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
    ) AS exists`,
    [table]
  )

  if (!targetExists.rows[0]?.exists) {
    console.log(`${table}: target table not found — run migrate:deploy first`)
    return 0
  }

  const rows = await source.query(`SELECT ${columns} FROM ${table}`)
  let inserted = 0

  for (const row of rows.rows) {
    const keys = Object.keys(row)
    const values = keys.map((_, index) => `$${index + 1}`)
    await target.query(
      `INSERT INTO ${table} (${keys.map(key => `"${key}"`).join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING`,
      keys.map(key => row[key])
    )
    inserted += 1
  }

  return inserted
}

async function main(): Promise<void> {
  const adminUrl = resolveAdminDatabaseUrl()
  const admin = new pg.Client({ connectionString: adminUrl })
  await admin.connect()

  try {
    const legacyExists = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [LEGACY_DATABASE]
    )

    if (legacyExists.rowCount === 0) {
      console.log(
        `legacy database ${LEGACY_DATABASE} not found — skipping split migration`
      )
      return
    }
  } finally {
    await admin.end()
  }

  const legacyUrl = resolveAdminDatabaseUrl().replace(
    /\/[^/?]+(\?|$)/,
    `/${LEGACY_DATABASE}$1`
  )

  const source = new pg.Client({ connectionString: legacyUrl })
  await source.connect()

  try {
    if (!(await legacySchemaExists(source))) {
      console.log(
        `legacy database ${LEGACY_DATABASE} has no unified schema (tables: ${LEGACY_SCHEMA_TABLES.join(', ')}) — skipping split migration`
      )
      return
    }

    const targets: Array<{
      domain: keyof typeof SERVICE_DATABASE_NAMES
      tables: Array<{ name: string; columns: string }>
    }> = [
      {
        domain: 'customers',
        tables: [
          {
            name: 'customers',
            columns: 'id, name, tax_id, created_at, updated_at'
          },
          {
            name: 'accounts',
            columns: 'id, customer_id, email, status, created_at, updated_at'
          }
        ]
      },
      {
        domain: 'orders',
        tables: [
          {
            name: 'orders',
            columns:
              'id, customer_id, warehouse_id, status, rejection_reason, idempotency_key, correlation_id, created_at, updated_at'
          },
          {
            name: 'order_lines',
            columns: 'id, order_id, sku, quantity'
          }
        ]
      },
      {
        domain: 'inventory',
        tables: [
          {
            name: 'inventory',
            columns: 'sku, warehouse_id, quantity, updated_at'
          },
          {
            name: 'reservations',
            columns: 'id, order_id, sku, warehouse_id, quantity, created_at'
          }
        ]
      }
    ]

    for (const { domain, tables } of targets) {
      const target = new pg.Client({
        connectionString: resolveDatabaseUrl(domain)
      })
      await target.connect()

      try {
        for (const table of tables) {
          const count = await copyTable(
            source,
            target,
            table.name,
            table.columns
          )
          console.log(`${domain}.${table.name}: copied ${count} rows`)
        }
      } finally {
        await target.end()
      }
    }

    console.log('legacy split migration completed')
  } finally {
    await source.end()
  }
}

main().catch(error => {
  console.error('legacy split migration failed', error)
  process.exit(1)
})
