export type ProductItem = {
  sku: string
  name: string
  price: number
  category: string
  imageKey: string
  active?: boolean
}

export function isActiveProduct(product: ProductItem): boolean {
  return product.active !== false
}

export function parseProductItem(
  item: Record<string, unknown>
): ProductItem | null {
  const sku = readString(item.sku)
  const name = readString(item.name)
  const category = readString(item.category)
  const imageKey = readString(item.imageKey)
  const price = readNumber(item.price)

  if (!sku || !name || !category || !imageKey || price === null) {
    return null
  }

  const active =
    typeof item.active === 'boolean'
      ? item.active
      : item.active === undefined
        ? undefined
        : false

  return {
    sku,
    name,
    price,
    category,
    imageKey,
    ...(active === undefined ? {} : { active })
  }
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}
