export const EVENT_SOURCE = 'distrinorte'

export type OrderLine = {
  sku: string
  quantity: number
}

export type OrderCreatedEvent = {
  orderId: string
  customerId: string
  warehouseId: string
  lines: OrderLine[]
  correlationId: string
}

export type StockReservedEvent = {
  orderId: string
  reservationId: string
  lines: OrderLine[]
  correlationId: string
}

export type StockRejectedEvent = {
  orderId: string
  reason: string
  lines: OrderLine[]
  correlationId: string
}

export const EventDetailType = {
  OrderCreated: 'order.created',
  StockReserved: 'order.stock_reserved',
  StockRejected: 'order.stock_rejected'
} as const
