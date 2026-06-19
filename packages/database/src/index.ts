import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

import { PrismaClient } from '../generated/client.js'

export * from '../generated/client.js'

function resolveDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ??
    'postgresql://user:password@localhost:5432/distrinorte?schema=public'
  )
}

export function createPrismaClient(
  databaseUrl = resolveDatabaseUrl()
): PrismaClient {
  const pool = new pg.Pool({ connectionString: databaseUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}
