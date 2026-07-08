export const EVENT_SOURCE = 'distrinorte'

export const EventDetailType = {
  OrderCreated: 'order.created',
  StockReserved: 'order.stock_reserved',
  StockRejected: 'order.stock_rejected',
  OrderConfirmed: 'order.confirmed',
  CustomerRegistered: 'customer.registered',
  CustomerUpdated: 'customer.updated',
  CatalogPriceUpdated: 'catalog.price_updated',
  AvailabilityUpdated: 'availability.updated'
} as const

export type EventDetailTypeName =
  (typeof EventDetailType)[keyof typeof EventDetailType]
