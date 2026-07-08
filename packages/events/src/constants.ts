export const EVENT_SOURCE = 'distrinorte'

export const EventDetailType = {
  OrderCreated: 'order.created',
  StockReserved: 'order.stock_reserved',
  StockRejected: 'order.stock_rejected',
  StockPendingTransfer: 'order.stock_pending_transfer',
  StockTransferCompleted: 'stock.transfer_completed',
  OrderConfirmed: 'order.confirmed',
  InvoiceIssued: 'invoice.issued',
  InvoiceFailed: 'invoice.failed',
  CustomerRegistered: 'customer.registered',
  CustomerUpdated: 'customer.updated',
  CatalogPriceUpdated: 'catalog.price_updated',
  AvailabilityUpdated: 'availability.updated'
} as const

export type EventDetailTypeName =
  (typeof EventDetailType)[keyof typeof EventDetailType]
