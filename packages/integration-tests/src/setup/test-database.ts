import { createPrismaClient, type PrismaClient } from '@distrinorte/database'

let client: PrismaClient | undefined

export function getTestPrisma(): PrismaClient {
  if (!client) {
    client = createPrismaClient()
  }

  return client
}

export async function disconnectTestPrisma(): Promise<void> {
  if (client) {
    await client.$disconnect()
    client = undefined
  }
}

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      reservations,
      order_lines,
      orders,
      inventory,
      accounts,
      customers
    RESTART IDENTITY CASCADE
  `)
}
