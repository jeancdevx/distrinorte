export {
  EVENT_SOURCE,
  EventDetailType,
  type EventDetailTypeName
} from './constants.js'
export type { OrderLine } from './types/order-line.js'
export type {
  DomainEvent,
  OrderCreatedEvent,
  StockRejectedEvent,
  StockReservedEvent
} from './types/domain-events.js'
export {
  buildOrderCreatedEntry,
  buildStockRejectedEntry,
  buildStockReservedEntry,
  parseEventDetail,
  parseSqsEventBridgeBody,
  serializeEventDetail,
  type EventBridgeEntry,
  type SqsEventBridgeBody
} from './envelope/eventbridge.js'
