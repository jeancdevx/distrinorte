import {
  EVENT_SOURCE,
  EventDetailType,
  type EventDetailTypeName
} from '@/constants.js'
import type {
  OrderCreatedEvent,
  StockRejectedEvent,
  StockReservedEvent
} from '@/types/domain-events.js'

export type EventBridgeEntry = {
  Source: typeof EVENT_SOURCE
  DetailType: EventDetailTypeName
  Detail: string
  EventBusName?: string
  Time?: string
}

export function serializeEventDetail<TDetail>(detail: TDetail): string {
  return JSON.stringify(detail)
}

export function parseEventDetail<TDetail>(detail: string): TDetail {
  return JSON.parse(detail) as TDetail
}

export function buildOrderCreatedEntry(
  detail: OrderCreatedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return {
    Source: EVENT_SOURCE,
    DetailType: EventDetailType.OrderCreated,
    Detail: serializeEventDetail(detail),
    ...(eventBusName ? { EventBusName: eventBusName } : {})
  }
}

export function buildStockReservedEntry(
  detail: StockReservedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return {
    Source: EVENT_SOURCE,
    DetailType: EventDetailType.StockReserved,
    Detail: serializeEventDetail(detail),
    ...(eventBusName ? { EventBusName: eventBusName } : {})
  }
}

export function buildStockRejectedEntry(
  detail: StockRejectedEvent,
  eventBusName?: string
): EventBridgeEntry {
  return {
    Source: EVENT_SOURCE,
    DetailType: EventDetailType.StockRejected,
    Detail: serializeEventDetail(detail),
    ...(eventBusName ? { EventBusName: eventBusName } : {})
  }
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
