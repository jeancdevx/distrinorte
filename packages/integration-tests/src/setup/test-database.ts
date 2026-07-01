import {
  createCustomersPrismaClient,
  type PrismaClient as CustomersPrismaClient
} from '@distrinorte/database/customers'
import {
  createInventoryPrismaClient,
  type PrismaClient as InventoryPrismaClient
} from '@distrinorte/database/inventory'
import {
  createOrdersPrismaClient,
  type PrismaClient as OrdersPrismaClient
} from '@distrinorte/database/orders'

export type TestPrismaClients = {
  customers: CustomersPrismaClient
  orders: OrdersPrismaClient
  inventory: InventoryPrismaClient
}

let clients: TestPrismaClients | undefined

export function getTestPrismaClients(): TestPrismaClients {
  if (!clients) {
    clients = {
      customers: createCustomersPrismaClient(),
      orders: createOrdersPrismaClient(),
      inventory: createInventoryPrismaClient()
    }
  }

  return clients
}

/** @deprecated use getTestPrismaClients().orders */
export function getTestPrisma(): OrdersPrismaClient {
  return getTestPrismaClients().orders
}

export async function disconnectTestPrisma(): Promise<void> {
  if (!clients) {
    return
  }

  await Promise.all([
    clients.customers.$disconnect(),
    clients.orders.$disconnect(),
    clients.inventory.$disconnect()
  ])

  clients = undefined
}

export async function resetDatabase(
  prismaClients: TestPrismaClients = getTestPrismaClients()
): Promise<void> {
  await prismaClients.orders.$executeRawUnsafe(`
    TRUNCATE TABLE order_lines, orders, customer_snapshots, price_snapshots RESTART IDENTITY CASCADE
  `)
  await prismaClients.customers.$executeRawUnsafe(`
    TRUNCATE TABLE accounts, customers RESTART IDENTITY CASCADE
  `)
  await prismaClients.inventory.$executeRawUnsafe(`
    TRUNCATE TABLE reservations, inventory, transfer_matrix, warehouses RESTART IDENTITY CASCADE
  `)
}
