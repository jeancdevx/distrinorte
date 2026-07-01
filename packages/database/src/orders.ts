import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/orders/client.js'

import { resolveDatabaseUrl, resolvePgSslConfig } from './database-url.js'

export * from '../generated/orders/client.js'

export function createOrdersPrismaClient(
  databaseUrl = resolveDatabaseUrl('orders')
): PrismaClient {
  const ssl = resolvePgSslConfig()
  const adapter = new PrismaPg(
    ssl
      ? { connectionString: databaseUrl, ssl }
      : { connectionString: databaseUrl }
  )

  return new PrismaClient({ adapter })
}

/** Alias used by orders-service */
export const createPrismaClient = createOrdersPrismaClient

export type OrdersPrismaClient = PrismaClient
