import type { OrderLine } from './order-line.js'

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

export type DomainEvent =
  | OrderCreatedEvent
  | StockReservedEvent
  | StockRejectedEvent
