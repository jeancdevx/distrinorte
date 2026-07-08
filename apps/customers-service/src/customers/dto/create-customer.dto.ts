export type CreateCustomerInput = {
  name: string
  taxId: string
  email: string
  assignedWarehouseId: string
}

export function parseCreateCustomerInput(body: unknown): CreateCustomerInput {
  if (typeof body !== 'object' || body === null) {
    throw new Error('INVALID_BODY')
  }

  const record = body as Record<string, unknown>
  const name = readNonEmptyString(record.name, 'name')
  const taxId = readNonEmptyString(record.taxId, 'taxId')
  const email = readNonEmptyString(record.email, 'email')
  const assignedWarehouseId = readRequiredWarehouseId(
    record.assignedWarehouseId
  )

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('INVALID_EMAIL')
  }

  return { name, taxId, email, assignedWarehouseId }
}

function readRequiredWarehouseId(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('INVALID_ASSIGNEDWAREHOUSEID')
  }

  return value.trim()
}

function readNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`INVALID_${field.toUpperCase()}`)
  }

  return value.trim()
}
