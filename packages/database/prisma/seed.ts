import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { AccountStatus, createPrismaClient } from '../src/index.js'

type DemoCustomer = {
  id: string
  name: string
  taxId: string
  account: {
    email: string
    status: 'ACTIVE' | 'SUSPENDED'
  }
}

type DemoProduct = {
  sku: string
  stock: Record<string, number>
}

type DemoProductsFile = {
  warehouses: string[]
  products: DemoProduct[]
}

type DemoCustomersFile = {
  customers: DemoCustomer[]
}

const packageDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(packageDir, '../../..')

function readJson<T>(relativePath: string): T {
  const absolutePath = join(repoRoot, relativePath)
  return JSON.parse(readFileSync(absolutePath, 'utf8')) as T
}

async function seedCustomers(
  prisma: ReturnType<typeof createPrismaClient>
): Promise<void> {
  const { customers } = readJson<DemoCustomersFile>('data/demo/customers.json')

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
}

async function seedInventory(
  prisma: ReturnType<typeof createPrismaClient>
): Promise<void> {
  const { products } = readJson<DemoProductsFile>('data/demo/products.json')

  for (const product of products) {
    for (const [warehouseId, quantity] of Object.entries(product.stock)) {
      await prisma.inventory.upsert({
        where: {
          sku_warehouseId: {
            sku: product.sku,
            warehouseId
          }
        },
        create: {
          sku: product.sku,
          warehouseId,
          quantity
        },
        update: {
          quantity
        }
      })
    }
  }

  console.log(`inventory upserted for ${products.length} products`)
}

async function main(): Promise<void> {
  const prisma = createPrismaClient()

  try {
    await seedCustomers(prisma)
    await seedInventory(prisma)
    console.log('RDS demo seed completed')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error('RDS demo seed failed', error)
  process.exit(1)
})
