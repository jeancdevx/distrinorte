import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export type DemoProduct = {
  sku: string
  name: string
  price: number
  category: string
  imageKey: string
  active?: boolean
  stock: Record<string, number>
}

export type DemoProductsFile = {
  warehouses: string[]
  products: DemoProduct[]
}

const packageDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(packageDir, '../../../..')

export function loadDemoProducts(): DemoProductsFile {
  const absolutePath = join(repoRoot, 'data/demo/products.json')
  return JSON.parse(readFileSync(absolutePath, 'utf8')) as DemoProductsFile
}
