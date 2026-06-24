import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/client.js'

import { resolveDatabaseUrl, resolvePgSslConfig } from './database-url.js'

export * from '../generated/client.js'
export {
  resolveDatabaseUrl,
  resolvePgSslConfig,
  shouldUseDatabaseSsl
} from './database-url.js'

export function createPrismaClient(
  databaseUrl = resolveDatabaseUrl()
): PrismaClient {
  const ssl = resolvePgSslConfig()
  const adapter = new PrismaPg(
    ssl
      ? { connectionString: databaseUrl, ssl }
      : { connectionString: databaseUrl }
  )

  return new PrismaClient({ adapter })
}
