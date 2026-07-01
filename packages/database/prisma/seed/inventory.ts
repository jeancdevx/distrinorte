import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createInventoryPrismaClient } from '../../src/inventory.js'
import { createOrdersPrismaClient } from '../../src/orders.js'

type WarehouseSeed = {
  id: string
  name: string
  isCentral: boolean
  timezone?: string
}

type TransferMatrixSeed = {
  fromWarehouseId: string
  toWarehouseId: string
  businessDays: number
  cutoffHour?: number
}

type WarehousesFile = {
  warehouses: WarehouseSeed[]
  transferMatrix: TransferMatrixSeed[]
}

type DemoProduct = {
  sku: string
  stock: Record<string, number>
}

type DemoProductsFile = {
  products: DemoProduct[]
}

const packageDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(packageDir, '../../../..')

function readJson<T>(relativePath: string): T {
  const absolutePath = join(repoRoot, relativePath)
  return JSON.parse(readFileSync(absolutePath, 'utf8')) as T
}

export async function seedInventoryDomain(): Promise<void> {
  const prisma = createInventoryPrismaClient()
  const ordersPrisma = createOrdersPrismaClient()
  const { warehouses, transferMatrix } = readJson<WarehousesFile>(
    'data/demo/warehouses.json'
  )
  const { products } = readJson<DemoProductsFile>('data/demo/products.json')

  try {
    for (const warehouse of warehouses) {
      await prisma.warehouse.upsert({
        where: { id: warehouse.id },
        create: {
          id: warehouse.id,
          name: warehouse.name,
          isCentral: warehouse.isCentral,
          timezone: warehouse.timezone ?? 'America/Lima'
        },
        update: {
          name: warehouse.name,
          isCentral: warehouse.isCentral,
          timezone: warehouse.timezone ?? 'America/Lima'
        }
      })
    }

    console.log(`warehouses upserted: ${warehouses.length}`)

    for (const entry of transferMatrix) {
      await prisma.transferMatrix.upsert({
        where: {
          fromWarehouseId_toWarehouseId: {
            fromWarehouseId: entry.fromWarehouseId,
            toWarehouseId: entry.toWarehouseId
          }
        },
        create: {
          fromWarehouseId: entry.fromWarehouseId,
          toWarehouseId: entry.toWarehouseId,
          businessDays: entry.businessDays,
          cutoffHour: entry.cutoffHour ?? 14
        },
        update: {
          businessDays: entry.businessDays,
          cutoffHour: entry.cutoffHour ?? 14
        }
      })
    }

    console.log(`transfer matrix upserted: ${transferMatrix.length} routes`)

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

    for (const product of products) {
      await ordersPrisma.priceSnapshot.upsert({
        where: { sku: product.sku },
        create: {
          sku: product.sku,
          unitPriceNet: product.price,
          saleUnit: 'UN',
          unitsPerBaseUnit: 1,
          taxAffectation: 'GRAVADO',
          version: 1
        },
        update: {
          unitPriceNet: product.price,
          version: 1
        }
      })
    }

    console.log(`price_snapshots upserted for ${products.length} products`)
  } finally {
    await prisma.$disconnect()
    await ordersPrisma.$disconnect()
  }
}
