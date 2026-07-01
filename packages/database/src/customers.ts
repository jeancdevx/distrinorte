import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/customers/client.js'

import {
  resolveDatabaseUrl,
  resolvePgSslConfig,
  type DatabaseDomain
} from './database-url.js'

export * from '../generated/customers/client.js'

export function createCustomersPrismaClient(
  databaseUrl = resolveDatabaseUrl('customers')
): PrismaClient {
  return createPrismaClientForUrl(databaseUrl)
}

/** @deprecated Use createCustomersPrismaClient — kept for customers-service imports */
export const createPrismaClient = createCustomersPrismaClient

function createPrismaClientForUrl(databaseUrl: string): PrismaClient {
  const ssl = resolvePgSslConfig()
  const adapter = new PrismaPg(
    ssl
      ? { connectionString: databaseUrl, ssl }
      : { connectionString: databaseUrl }
  )

  return new PrismaClient({ adapter })
}

export type { DatabaseDomain }
