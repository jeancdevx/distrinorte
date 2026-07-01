import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  AccountStatus,
  createCustomersPrismaClient
} from '../../src/customers.js'

type DemoCustomer = {
  id: string
  name: string
  taxId: string
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
  const { customers } = readJson<DemoCustomersFile>('data/demo/customers.json')

  try {
    for (const customer of customers) {
      await prisma.customer.upsert({
        where: { taxId: customer.taxId },
        create: {
          id: customer.id,
          name: customer.name,
          taxId: customer.taxId,
          accounts: {
            create: {
              email: customer.account.email,
              status: customer.account.status as AccountStatus
            }
          }
        },
        update: {
          name: customer.name
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

      console.log(`customer upserted: ${customer.taxId} (${customer.id})`)
    }
  } finally {
    await prisma.$disconnect()
  }
}
