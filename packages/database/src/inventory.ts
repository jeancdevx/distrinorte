import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/inventory/client.js'

import { resolveDatabaseUrl, resolvePgSslConfig } from './database-url.js'

export * from '../generated/inventory/client.js'

export function createInventoryPrismaClient(
  databaseUrl = resolveDatabaseUrl('inventory')
): PrismaClient {
  const ssl = resolvePgSslConfig()
  const adapter = new PrismaPg(
    ssl
      ? { connectionString: databaseUrl, ssl }
      : { connectionString: databaseUrl }
  )

  return new PrismaClient({ adapter })
}

/** Alias used by inventory-service */
export const createPrismaClient = createInventoryPrismaClient

export type InventoryPrismaClient = PrismaClient
