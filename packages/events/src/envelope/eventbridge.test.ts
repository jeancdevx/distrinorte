import { describe, expect, it } from 'vitest'

import { EVENT_SOURCE, EventDetailType } from '@/constants.js'
import {
  buildOrderCreatedEntry,
  buildStockRejectedEntry,
  buildStockReservedEntry,
  parseEventDetail,
  parseSqsEventBridgeBody,
  serializeEventDetail
} from '@/envelope/eventbridge.js'

describe('eventbridge envelope helpers', () => {
  const orderCreatedDetail = {
    orderId: 'ord-1',
    customerId: 'cust-1',
    warehouseId: 'trujillo',
    lines: [
      {
        sku: 'SKU-1',
        quantity: 10,
        unitPriceNet: 25,
        saleUnit: 'UN',
        unitsPerBaseUnit: 1,
        taxAffectation: 'GRAVADO',
        lineNet: 250,
        lineTax: 45,
        lineGross: 295
      }
    ],
    totalNet: 250,
    totalTax: 45,
    totalGross: 295,
    correlationId: 'corr-1'
  }

  it('serializes and parses event detail', () => {
    const json = serializeEventDetail(orderCreatedDetail)

    expect(parseEventDetail(json)).toEqual(orderCreatedDetail)
  })

  it('builds order.created entry', () => {
    expect(buildOrderCreatedEntry(orderCreatedDetail, 'bus-dev')).toEqual({
      Source: EVENT_SOURCE,
      DetailType: EventDetailType.OrderCreated,
      Detail: serializeEventDetail(orderCreatedDetail),
      EventBusName: 'bus-dev'
    })
  })

  it('builds stock reserved and rejected entries', () => {
    const reserved = {
      orderId: 'ord-1',
      reservationId: 'res-1',
      lines: [{ sku: 'SKU-1', quantity: 2 }],
      fulfillment: [],
      transferDays: 0,
      transferMatrix: [],
      confirmedAt: '2026-01-01T00:00:00.000Z',
      correlationId: 'corr-1'
    }
    const rejected = {
      orderId: 'ord-1',
      reason: 'Insufficient stock',
      lines: [{ sku: 'SKU-1', quantity: 2 }],
      correlationId: 'corr-1'
    }

    expect(buildStockReservedEntry(reserved).DetailType).toBe(
      EventDetailType.StockReserved
    )
    expect(buildStockRejectedEntry(rejected).DetailType).toBe(
      EventDetailType.StockRejected
    )
  })

  it('parses SQS EventBridge body', () => {
    const body = JSON.stringify({
      version: '0',
      id: 'evt-1',
      'detail-type': EventDetailType.OrderCreated,
      source: EVENT_SOURCE,
      account: '123',
      time: '2026-01-01T00:00:00Z',
      region: 'us-east-2',
      detail: orderCreatedDetail
    })

    expect(parseSqsEventBridgeBody(body)).toEqual(JSON.parse(body))
  })
})
