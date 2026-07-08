import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { OrderStatus } from '@distrinorte/database/orders'

import { PrismaService } from '../../../../apps/inventory-service/src/database/prisma.service.js'
import { InventoryService } from '../../../../apps/inventory-service/src/inventory/inventory.service.js'
import { SourcingService } from '../../../../apps/inventory-service/src/inventory/sourcing.service.js'
import { StockReservationService } from '../../../../apps/inventory-service/src/inventory/stock-reservation.service.js'
import { RedisService } from '../../../../apps/inventory-service/src/redis/redis.service.js'
import { PrismaService as OrdersPrismaService } from '../../../../apps/orders-service/src/database/prisma.service.js'
import { OrderEventsHandler } from '../../../../apps/orders-service/src/orders/order-events.handler.js'
import { OrdersService } from '../../../../apps/orders-service/src/orders/orders.service.js'
import { OutboxProcessor } from '../../../../apps/orders-service/src/outbox/outbox.processor.js'
import {
  FakeEventBridgePublisher,
  createInMemoryRedis
} from '../setup/fakes.js'
import {
  disconnectTestPrisma,
  getTestPrismaClients,
  resetDatabase
} from '../setup/test-database.js'

describe('Order stock flow (integration)', () => {
  const {
    customers,
    orders,
    inventory: inventoryPrisma
  } = getTestPrismaClients()
  const ordersEventBridge = new FakeEventBridgePublisher()
  const inventoryEventBridge = new FakeEventBridgePublisher()
  const redis = createInMemoryRedis()

  const ordersOutbox = new OutboxProcessor(
    { db: orders } as OrdersPrismaService,
    ordersEventBridge as never
  )
  const ordersService = new OrdersService(
    { db: orders } as OrdersPrismaService,
    ordersOutbox
  )
  const orderEventsHandler = new OrderEventsHandler(
    { db: orders } as OrdersPrismaService,
    ordersOutbox
  )
  const inventoryService = new InventoryService(
    { db: inventoryPrisma } as PrismaService,
    { client: redis.client } as RedisService
  )
  const stockReservationService = new StockReservationService(
    { db: inventoryPrisma } as PrismaService,
    inventoryService,
    inventoryEventBridge as never,
    new SourcingService()
  )

  let customerId: string

  beforeEach(async () => {
    await resetDatabase()
    redis.clear()
    ordersEventBridge.orderCreated.length = 0
    ordersEventBridge.orderConfirmed.length = 0
    inventoryEventBridge.stockReserved.length = 0
    inventoryEventBridge.stockRejected.length = 0
    inventoryEventBridge.availabilityUpdated.length = 0

    const customer = await customers.customer.create({
      data: {
        name: 'Cliente Flujo',
        taxId: '20888777666',
        assignedWarehouseId: 'trujillo',
        accounts: {
          create: {
            email: 'flujo@integration.demo'
          }
        }
      }
    })

    customerId = customer.id

    await orders.customerSnapshot.create({
      data: {
        customerId: customer.id,
        taxId: customer.taxId,
        assignedWarehouseId: 'trujillo',
        status: 'ACTIVE'
      }
    })

    await orders.priceSnapshot.create({
      data: {
        sku: 'SKU-FLOW-1',
        unitPriceNet: 25,
        saleUnit: 'UN',
        unitsPerBaseUnit: 1,
        taxAffectation: 'GRAVADO'
      }
    })

    await inventoryPrisma.inventory.create({
      data: {
        sku: 'SKU-FLOW-1',
        warehouseId: 'trujillo',
        quantity: 10
      }
    })
  })

  afterAll(async () => {
    await disconnectTestPrisma()
  })

  it('reserves stock after order.created when inventory is sufficient', async () => {
    const order = await ordersService.create(
      {
        lines: [{ sku: 'SKU-FLOW-1', quantity: 10 }]
      },
      'idem-flow-1',
      'corr-flow-1',
      customerId
    )

    const publishedEvent = ordersEventBridge.orderCreated[0]
    expect(publishedEvent).toBeDefined()

    await stockReservationService.handleOrderCreated(publishedEvent!)
    await orderEventsHandler.processMessageBody(
      JSON.stringify({
        version: '0',
        id: 'evt-1',
        'detail-type': 'order.stock_reserved',
        source: 'distrinorte',
        account: '123',
        time: new Date().toISOString(),
        region: 'us-east-2',
        detail: inventoryEventBridge.stockReserved[0]
      })
    )

    const inventory = await inventoryPrisma.inventory.findUnique({
      where: {
        sku_warehouseId: {
          sku: 'SKU-FLOW-1',
          warehouseId: 'trujillo'
        }
      }
    })
    const reservations = await inventoryPrisma.reservation.findMany({
      where: { orderId: order.orderId }
    })
    const confirmed = await orders.order.findUnique({
      where: { id: order.orderId }
    })

    expect(inventory?.quantity).toBe(0)
    expect(reservations).toHaveLength(1)
    expect(confirmed?.status).toBe(OrderStatus.CONFIRMED)
    expect(inventoryEventBridge.stockReserved).toHaveLength(1)
    expect(inventoryEventBridge.stockRejected).toHaveLength(0)
    expect(ordersEventBridge.orderConfirmed).toHaveLength(1)
  })

  it('rejects the order when stock is insufficient', async () => {
    const order = await ordersService.create(
      {
        lines: [{ sku: 'SKU-FLOW-1', quantity: 50 }]
      },
      'idem-flow-2',
      'corr-flow-2',
      customerId
    )

    const publishedEvent = ordersEventBridge.orderCreated[0]
    expect(publishedEvent).toBeDefined()

    await stockReservationService.handleOrderCreated(publishedEvent!)
    await orderEventsHandler.processMessageBody(
      JSON.stringify({
        version: '0',
        id: 'evt-2',
        'detail-type': 'order.stock_rejected',
        source: 'distrinorte',
        account: '123',
        time: new Date().toISOString(),
        region: 'us-east-2',
        detail: inventoryEventBridge.stockRejected[0]
      })
    )

    const inventory = await inventoryPrisma.inventory.findUnique({
      where: {
        sku_warehouseId: {
          sku: 'SKU-FLOW-1',
          warehouseId: 'trujillo'
        }
      }
    })
    const reservations = await inventoryPrisma.reservation.count({
      where: { orderId: order.orderId }
    })
    const rejected = await orders.order.findUnique({
      where: { id: order.orderId }
    })

    expect(inventory?.quantity).toBe(10)
    expect(reservations).toBe(0)
    expect(rejected?.status).toBe(OrderStatus.REJECTED)
    expect(inventoryEventBridge.stockRejected).toHaveLength(1)
  })
})
