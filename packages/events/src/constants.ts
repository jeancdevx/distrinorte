export const EVENT_SOURCE = 'distrinorte'

export const EventDetailType = {
  OrderCreated: 'order.created',
  StockReserved: 'order.stock_reserved',
  StockRejected: 'order.stock_rejected'
} as const

export type EventDetailTypeName =
  (typeof EventDetailType)[keyof typeof EventDetailType]
