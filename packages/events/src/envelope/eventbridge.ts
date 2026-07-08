import {
  EVENT_SOURCE,
  EventDetailType,
  type EventDetailTypeName
} from '@/constants.js'
import type {
  InvoiceFailedEvent,
  InvoiceIssuedEvent,
  OrderConfirmedEvent,
  OrderCreatedEvent,
  StockPendingTransferEvent,
  StockRejectedEvent,
  StockReservedEvent,
  StockTransferCompletedEvent
} from '@/types/domain-events.js'
import type {
  AvailabilityUpdatedEvent,
  CatalogPriceUpdatedEvent,
  CustomerRegisteredEvent,
  CustomerUpdatedEvent
} from '@/types/projection-events.js'

export type EventBridgeEntry = {
  Source: typeof EVENT_SOURCE
  DetailType: EventDetailTypeName
  Detail: string
  EventBusName?: string
}

export function serializeEventDetail<TDetail>(detail: TDetail): string {
  return JSON.stringify(detail)
}

export function parseEventDetail<TDetail>(detail: string): TDetail {
  return JSON.parse(detail) as TDetail
}

function buildEntry<TDetail>(
  detailType: EventDetailTypeName,
  detail: TDetail,
  eventBusName?: string
): EventBridgeEntry {
  return {
    Source: EVENT_SOURCE,
    DetailType: detailType,
    Detail: serializeEventDetail(detail),
    ...(eventBusName ? { EventBusName: eventBusName } : {})
  }
}

export function buildOrderCreatedEntry(
  detail: OrderCreatedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.OrderCreated, detail, eventBusName)
}

export function buildStockReservedEntry(
  detail: StockReservedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.StockReserved, detail, eventBusName)
}

export function buildStockRejectedEntry(
  detail: StockRejectedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.StockRejected, detail, eventBusName)
}

export function buildStockPendingTransferEntry(
  detail: StockPendingTransferEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.StockPendingTransfer, detail, eventBusName)
}

export function buildStockTransferCompletedEntry(
  detail: StockTransferCompletedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(
    EventDetailType.StockTransferCompleted,
    detail,
    eventBusName
  )
}

export function buildOrderConfirmedEntry(
  detail: OrderConfirmedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.OrderConfirmed, detail, eventBusName)
}

export function buildInvoiceIssuedEntry(
  detail: InvoiceIssuedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.InvoiceIssued, detail, eventBusName)
}

export function buildInvoiceFailedEntry(
  detail: InvoiceFailedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.InvoiceFailed, detail, eventBusName)
}

export function buildCustomerRegisteredEntry(
  detail: CustomerRegisteredEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.CustomerRegistered, detail, eventBusName)
}

export function buildCustomerUpdatedEntry(
  detail: CustomerUpdatedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.CustomerUpdated, detail, eventBusName)
}

export function buildCatalogPriceUpdatedEntry(
  detail: CatalogPriceUpdatedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.CatalogPriceUpdated, detail, eventBusName)
}

export function buildAvailabilityUpdatedEntry(
  detail: AvailabilityUpdatedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return buildEntry(EventDetailType.AvailabilityUpdated, detail, eventBusName)
}

export type SqsEventBridgeBody<TDetail> = {
  version: string
  id: string
  'detail-type': EventDetailTypeName
  source: typeof EVENT_SOURCE
  account: string
  time: string
  region: string
  detail: TDetail
}

export function parseSqsEventBridgeBody<TDetail>(
  body: string
): SqsEventBridgeBody<TDetail> {
  return JSON.parse(body) as SqsEventBridgeBody<TDetail>
}
