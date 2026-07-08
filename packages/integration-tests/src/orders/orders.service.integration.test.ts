import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { OrderStatus } from '@distrinorte/database/orders'

import { PrismaService } from '../../../../apps/orders-service/src/database/prisma.service.js'
import { OrdersService } from '../../../../apps/orders-service/src/orders/orders.service.js'
import { OutboxProcessor } from '../../../../apps/orders-service/src/outbox/outbox.processor.js'
import { FakeEventBridgePublisher } from '../setup/fakes.js'
import {
  disconnectTestPrisma,
  getTestPrismaClients,
  resetDatabase
} from '../setup/test-database.js'

describe('OrdersService (integration)', () => {
  const { customers, orders: prisma } = getTestPrismaClients()
  const eventBridge = new FakeEventBridgePublisher()
  const outboxProcessor = new OutboxProcessor(
    { db: prisma } as PrismaService,
    eventBridge as never
  )
  const service = new OrdersService(
    { db: prisma } as PrismaService,
    outboxProcessor
  )

  let customerId: string

  beforeEach(async () => {
    await resetDatabase()
    eventBridge.orderCreated.length = 0

    const customer = await customers.customer.create({
      data: {
        name: 'Cliente Integración',
        taxId: '20999000111',
        assignedWarehouseId: 'trujillo',
        accounts: {
          create: {
            email: 'integracion@orders.demo'
          }
        }
      }
    })

    customerId = customer.id

    await prisma.customerSnapshot.create({
      data: {
        customerId: customer.id,
        taxId: customer.taxId,
        assignedWarehouseId: 'trujillo',
        status: 'ACTIVE'
      }
    })

    await prisma.priceSnapshot.create({
      data: {
        sku: 'SKU-001',
        unitPriceNet: 25,
        saleUnit: 'CAJA',
        unitsPerBaseUnit: 1,
        taxAffectation: 'GRAVADO'
      }
    })
  })

  afterAll(async () => {
    await disconnectTestPrisma()
  })

  it('creates an order and publishes order.created', async () => {
    const order = await service.create(
      {
        lines: [{ sku: 'SKU-001', quantity: 10 }]
      },
      'idem-integration-1',
      'corr-integration-1',
      customerId
    )

    expect(order).toMatchObject({
      status: OrderStatus.PENDING,
      customerId,
      warehouseId: 'trujillo',
      totalGross: 295
    })

    const stored = await prisma.order.findUnique({
      where: { id: order.orderId },
      include: { lines: true }
    })

    expect(stored?.lines).toHaveLength(1)
    expect(eventBridge.orderCreated).toHaveLength(1)
    expect(eventBridge.orderCreated[0]).toMatchObject({
      orderId: order.orderId,
      customerId,
      warehouseId: 'trujillo',
      totalGross: 295
    })
  })

  it('returns the same order for repeated idempotency keys', async () => {
    const payload = {
      lines: [{ sku: 'SKU-001', quantity: 10 }]
    }

    const first = await service.create(
      payload,
      'idem-integration-2',
      'corr-1',
      customerId
    )
    const second = await service.create(
      payload,
      'idem-integration-2',
      'corr-2',
      customerId
    )

    expect(second.orderId).toBe(first.orderId)
    expect(await prisma.order.count()).toBe(1)
    expect(eventBridge.orderCreated).toHaveLength(1)
  })

  it('lists and fetches orders scoped to the authenticated customer', async () => {
    const created = await service.create(
      {
        lines: [{ sku: 'SKU-001', quantity: 10 }]
      },
      'idem-integration-3',
      'corr-3',
      customerId
    )

    const listed = await service.listByCustomer(customerId, 0, 10)
    const fetched = await service.getById(created.orderId, customerId)

    expect(listed.total).toBe(1)
    expect(listed.items[0]?.orderId).toBe(created.orderId)
    expect(fetched.orderId).toBe(created.orderId)
  })
})
