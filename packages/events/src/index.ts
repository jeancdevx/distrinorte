export {
  EVENT_SOURCE,
  EventDetailType,
  type EventDetailTypeName
} from './constants.js'
export type { OrderLine } from './types/order-line.js'
export type {
  DomainEvent,
  FulfillmentOrigin,
  OrderConfirmedEvent,
  OrderConfirmedLine,
  OrderCreatedEvent,
  OrderLineDetail,
  StockPendingTransferEvent,
  StockRejectedEvent,
  StockReservedEvent,
  StockTransferCompletedEvent,
  TransferMatrixSnapshot,
  AvailabilityUpdatedEvent,
  CatalogPriceUpdatedEvent,
  CustomerRegisteredEvent,
  CustomerUpdatedEvent
} from './types/domain-events.js'
export {
  buildAvailabilityUpdatedEntry,
  buildCatalogPriceUpdatedEntry,
  buildCustomerRegisteredEntry,
  buildCustomerUpdatedEntry,
  buildOrderConfirmedEntry,
  buildOrderCreatedEntry,
  buildStockPendingTransferEntry,
  buildStockRejectedEntry,
  buildStockReservedEntry,
  buildStockTransferCompletedEntry,
  parseEventDetail,
  parseSqsEventBridgeBody,
  serializeEventDetail,
  type EventBridgeEntry,
  type SqsEventBridgeBody
} from './envelope/eventbridge.js'
