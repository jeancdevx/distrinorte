import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

import { PrismaClient } from '../generated/client.js'

export * from '../generated/client.js'

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const host = process.env.DATABASE_HOST
  const name = process.env.DATABASE_NAME
  const user = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD

  if (host && name && user && password) {
    const port = process.env.DATABASE_PORT ?? '5432'
    const encodedUser = encodeURIComponent(user)
    const encodedPassword = encodeURIComponent(password)

    return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${name}?schema=public`
  }

  return 'postgresql://user:password@localhost:5432/distrinorte?schema=public'
}

export function createPrismaClient(
  databaseUrl = resolveDatabaseUrl()
): PrismaClient {
  const pool = new pg.Pool({ connectionString: databaseUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}
