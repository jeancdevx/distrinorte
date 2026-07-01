import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { OrderStatus } from '@distrinorte/database/orders'

import { PrismaService } from '../../../../apps/inventory-service/src/database/prisma.service.js'
import { InventoryService } from '../../../../apps/inventory-service/src/inventory/inventory.service.js'
import { StockReservationService } from '../../../../apps/inventory-service/src/inventory/stock-reservation.service.js'
import { RedisService } from '../../../../apps/inventory-service/src/redis/redis.service.js'
import { PrismaService as OrdersPrismaService } from '../../../../apps/orders-service/src/database/prisma.service.js'
import { OrdersService } from '../../../../apps/orders-service/src/orders/orders.service.js'
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

  const ordersService = new OrdersService(
    { db: orders } as OrdersPrismaService,
    ordersEventBridge as never
  )
  const inventoryService = new InventoryService(
    { db: inventoryPrisma } as PrismaService,
    { client: redis.client } as RedisService
  )
  const stockReservationService = new StockReservationService(
    { db: inventoryPrisma } as PrismaService,
    inventoryService,
    inventoryEventBridge as never
  )

  let customerId: string

  beforeEach(async () => {
    await resetDatabase()
    redis.clear()
    ordersEventBridge.orderCreated.length = 0
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

    await inventoryPrisma.inventory.create({
      data: {
        sku: 'SKU-FLOW-1',
        warehouseId: 'wh-norte',
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
        warehouseId: 'wh-norte',
        lines: [{ sku: 'SKU-FLOW-1', quantity: 4 }]
      },
      'idem-flow-1',
      'corr-flow-1',
      customerId
    )

    const publishedEvent = ordersEventBridge.orderCreated[0]
    expect(publishedEvent).toBeDefined()

    await stockReservationService.handleOrderCreated(publishedEvent!)

    const inventory = await inventoryPrisma.inventory.findUnique({
      where: {
        sku_warehouseId: {
          sku: 'SKU-FLOW-1',
          warehouseId: 'wh-norte'
        }
      }
    })
    const reservations = await inventoryPrisma.reservation.findMany({
      where: { orderId: order.orderId }
    })

    expect(inventory?.quantity).toBe(6)
    expect(reservations).toHaveLength(1)
    expect(reservations[0]).toMatchObject({
      sku: 'SKU-FLOW-1',
      quantity: 4
    })
    expect(inventoryEventBridge.stockReserved).toHaveLength(1)
    expect(inventoryEventBridge.stockRejected).toHaveLength(0)
    expect(inventoryEventBridge.availabilityUpdated).toHaveLength(1)
  })

  it('rejects the order when stock is insufficient', async () => {
    const order = await ordersService.create(
      {
        warehouseId: 'wh-norte',
        lines: [{ sku: 'SKU-FLOW-1', quantity: 50 }]
      },
      'idem-flow-2',
      'corr-flow-2',
      customerId
    )

    const publishedEvent = ordersEventBridge.orderCreated[0]
    expect(publishedEvent).toBeDefined()

    await stockReservationService.handleOrderCreated(publishedEvent!)

    const inventory = await inventoryPrisma.inventory.findUnique({
      where: {
        sku_warehouseId: {
          sku: 'SKU-FLOW-1',
          warehouseId: 'wh-norte'
        }
      }
    })
    const reservations = await inventoryPrisma.reservation.count({
      where: { orderId: order.orderId }
    })

    expect(inventory?.quantity).toBe(10)
    expect(reservations).toBe(0)
    expect(inventoryEventBridge.stockRejected).toHaveLength(1)
    expect(inventoryEventBridge.stockRejected[0]).toMatchObject({
      orderId: order.orderId,
      reason: expect.stringContaining('Insufficient stock')
    })
  })

  it('exposes reserved stock through InventoryService cache miss path', async () => {
    const order = await ordersService.create(
      {
        warehouseId: 'wh-norte',
        lines: [{ sku: 'SKU-FLOW-1', quantity: 2 }]
      },
      'idem-flow-3',
      'corr-flow-3',
      customerId
    )

    await stockReservationService.handleOrderCreated(
      ordersEventBridge.orderCreated[0]!
    )

    const stock = await inventoryService.getStock('SKU-FLOW-1', 'wh-norte')

    expect(stock.quantity).toBe(8)
    expect(order.status).toBe(OrderStatus.PENDING)
  })
})
