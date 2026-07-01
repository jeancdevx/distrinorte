import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  AccountStatus,
  createCustomersPrismaClient
} from '../../src/customers.js'
import { createOrdersPrismaClient } from '../../src/orders.js'

type DemoCustomer = {
  id: string
  name: string
  taxId: string
  assignedWarehouseId?: string
  account: {
    email: string
    status: 'ACTIVE' | 'SUSPENDED'
  }
}

type DemoCustomersFile = {
  customers: DemoCustomer[]
}

const packageDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(packageDir, '../../../..')

function readJson<T>(relativePath: string): T {
  const absolutePath = join(repoRoot, relativePath)
  return JSON.parse(readFileSync(absolutePath, 'utf8')) as T
}

export async function seedCustomers(): Promise<void> {
  const prisma = createCustomersPrismaClient()
  const ordersPrisma = createOrdersPrismaClient()
  const { customers } = readJson<DemoCustomersFile>('data/demo/customers.json')

  try {
    for (const customer of customers) {
      const assignedWarehouseId = customer.assignedWarehouseId ?? 'trujillo'

      const upserted = await prisma.customer.upsert({
        where: { taxId: customer.taxId },
        create: {
          id: customer.id,
          name: customer.name,
          taxId: customer.taxId,
          assignedWarehouseId,
          accounts: {
            create: {
              email: customer.account.email,
              status: customer.account.status as AccountStatus
            }
          }
        },
        update: {
          name: customer.name,
          assignedWarehouseId
        },
        include: {
          accounts: {
            take: 1,
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      await prisma.account.upsert({
        where: { email: customer.account.email },
        create: {
          customerId: customer.id,
          email: customer.account.email,
          status: customer.account.status as AccountStatus
        },
        update: {
          status: customer.account.status as AccountStatus
        }
      })

      const account = upserted.accounts[0]

      await ordersPrisma.customerSnapshot.upsert({
        where: { customerId: upserted.id },
        create: {
          customerId: upserted.id,
          taxId: upserted.taxId,
          assignedWarehouseId,
          status: account?.status ?? 'ACTIVE'
        },
        update: {
          taxId: upserted.taxId,
          assignedWarehouseId,
          status: account?.status ?? 'ACTIVE'
        }
      })

      console.log(`customer upserted: ${customer.taxId} (${customer.id})`)
    }
  } finally {
    await prisma.$disconnect()
    await ordersPrisma.$disconnect()
  }
}
