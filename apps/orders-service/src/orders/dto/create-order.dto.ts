import { isValidOrderLine, type OrderLineInput } from '@distrinorte/shared'

export type CreateOrderInput = {
  warehouseId: string
  lines: OrderLineInput[]
}

export function parseCreateOrderInput(body: unknown): CreateOrderInput {
  if (typeof body !== 'object' || body === null) {
    throw new Error('INVALID_BODY')
  }

  const record = body as Record<string, unknown>
  const warehouseId = readNonEmptyString(record.warehouseId, 'warehouseId')
  const lines = parseLines(record.lines)

  if (lines.length === 0) {
    throw new Error('INVALID_LINES')
  }

  return { warehouseId, lines }
}

function parseLines(value: unknown): OrderLineInput[] {
  if (!Array.isArray(value)) {
    throw new Error('INVALID_LINES')
  }

  const lines: OrderLineInput[] = []

  for (const item of value) {
    if (typeof item !== 'object' || item === null) {
      throw new Error('INVALID_LINES')
    }

    const line = item as Record<string, unknown>
    const sku = readNonEmptyString(line.sku, 'sku')
    const quantity = readPositiveInteger(line.quantity)

    const parsed = { sku, quantity }
    if (!isValidOrderLine(parsed)) {
      throw new Error('INVALID_LINES')
    }

    lines.push(parsed)
  }

  return lines
}

function readNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`INVALID_${field.toUpperCase()}`)
  }

  return value.trim()
}

function readPositiveInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error('INVALID_QUANTITY')
  }

  return value
}
