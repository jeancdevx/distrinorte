import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

import { PrismaClient } from '../generated/client.js'

import { resolveDatabaseUrl } from './database-url.js'

export * from '../generated/client.js'
export { resolveDatabaseUrl } from './database-url.js'

export function createPrismaClient(
  databaseUrl = resolveDatabaseUrl()
): PrismaClient {
  const pool = new pg.Pool({ connectionString: databaseUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}
