export type OrderLineInput = {
  sku: string
  quantity: number
}

export function isValidOrderLine(line: OrderLineInput): boolean {
  return (
    line.sku.trim().length > 0 &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0
  )
}
