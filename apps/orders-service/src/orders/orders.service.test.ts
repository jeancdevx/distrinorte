import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException
} from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrderStatus } from '@distrinorte/database/orders'

import { OrdersService } from './orders.service.js'

function buildOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ord-1',
    status: OrderStatus.PENDING,
    customerId: 'cust-1',
    warehouseId: 'trujillo',
    rejectionReason: null,
    totalNet: 250,
    totalTax: 45,
    totalGross: 295,
    estimatedDeliveryDate: null,
    invoiceId: null,
    pdfUrl: null,
    correlationId: 'corr-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
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
    ...overrides
  }
}

describe('OrdersService', () => {
  const prisma = {
    db: {
      order: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn()
      },
      customerSnapshot: {
        findUnique: vi.fn()
      },
      priceSnapshot: {
        findUnique: vi.fn()
      },
      outboxEvent: {
        create: vi.fn()
      },
      $transaction: vi.fn()
    }
  }
  const outboxProcessor = {
    flush: vi.fn()
  }

  let service: OrdersService

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.db.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma.db) => Promise<unknown>) =>
        callback(prisma.db)
    )
    service = new OrdersService(prisma as never, outboxProcessor as never)
  })

  describe('create', () => {
    it('returns an existing order for the same idempotency key', async () => {
      const existing = buildOrder()
      prisma.db.order.findUnique.mockResolvedValue(existing)

      const result = await service.create(
        { lines: [{ sku: 'SKU-1', quantity: 10 }] },
        'idem-1',
        'corr-1',
        'cust-1'
      )

      expect(result.orderId).toBe('ord-1')
      expect(prisma.db.customerSnapshot.findUnique).not.toHaveBeenCalled()
      expect(outboxProcessor.flush).not.toHaveBeenCalled()
    })

    it('hides another customer order behind not found', async () => {
      prisma.db.order.findUnique.mockResolvedValue(
        buildOrder({ customerId: 'cust-2' })
      )

      await expect(
        service.create({}, 'idem-1', 'corr-1', 'cust-1')
      ).rejects.toBeInstanceOf(NotFoundException)
    })

    it('rejects invalid payloads', async () => {
      prisma.db.order.findUnique.mockResolvedValue(null)

      await expect(
        service.create(null, 'idem-1', 'corr-1', 'cust-1')
      ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('requires a synced customer snapshot', async () => {
      prisma.db.order.findUnique.mockResolvedValue(null)
      prisma.db.customerSnapshot.findUnique.mockResolvedValue(null)

      await expect(
        service.create(
          { lines: [{ sku: 'SKU-1', quantity: 10 }] },
          'idem-1',
          'corr-1',
          'cust-1'
        )
      ).rejects.toBeInstanceOf(ServiceUnavailableException)
    })

    it('rejects orders below the minimum gross', async () => {
      prisma.db.order.findUnique.mockResolvedValue(null)
      prisma.db.customerSnapshot.findUnique.mockResolvedValue({
        customerId: 'cust-1',
        assignedWarehouseId: 'trujillo'
      })
      prisma.db.priceSnapshot.findUnique.mockResolvedValue({
        sku: 'SKU-1',
        unitPriceNet: 10,
        saleUnit: 'UN',
        unitsPerBaseUnit: 1,
        taxAffectation: 'GRAVADO'
      })

      await expect(
        service.create(
          { lines: [{ sku: 'SKU-1', quantity: 10 }] },
          'idem-1',
          'corr-1',
          'cust-1'
        )
      ).rejects.toBeInstanceOf(UnprocessableEntityException)
    })

    it('persists via outbox and flushes order.created', async () => {
      const created = buildOrder()
      prisma.db.order.findUnique.mockResolvedValue(null)
      prisma.db.customerSnapshot.findUnique.mockResolvedValue({
        customerId: 'cust-1',
        taxId: '20100000001',
        assignedWarehouseId: 'trujillo',
        status: 'ACTIVE'
      })
      prisma.db.priceSnapshot.findUnique.mockResolvedValue({
        sku: 'SKU-1',
        unitPriceNet: 25,
        saleUnit: 'UN',
        unitsPerBaseUnit: 1,
        taxAffectation: 'GRAVADO'
      })
      prisma.db.order.create.mockResolvedValue(created)
      outboxProcessor.flush.mockResolvedValue(undefined)

      const result = await service.create(
        { lines: [{ sku: 'SKU-1', quantity: 10 }] },
        'idem-1',
        'corr-1',
        'cust-1'
      )

      expect(result.status).toBe(OrderStatus.PENDING)
      expect(prisma.db.outboxEvent.create).toHaveBeenCalledOnce()
      expect(outboxProcessor.flush).toHaveBeenCalledOnce()
    })
  })

  describe('getById', () => {
    it('returns the order for the authenticated customer', async () => {
      prisma.db.order.findFirst.mockResolvedValue(buildOrder())

      const result = await service.getById('ord-1', 'cust-1')

      expect(result.orderId).toBe('ord-1')
    })

    it('throws when the order does not exist', async () => {
      prisma.db.order.findFirst.mockResolvedValue(null)

      await expect(service.getById('ord-1', 'cust-1')).rejects.toBeInstanceOf(
        NotFoundException
      )
    })
  })

  describe('listByCustomer', () => {
    it('returns mapped orders and total count', async () => {
      prisma.db.order.findMany.mockResolvedValue([buildOrder()])
      prisma.db.order.count.mockResolvedValue(1)

      const result = await service.listByCustomer('cust-1', 0, 20)

      expect(result).toEqual({
        items: [
          expect.objectContaining({
            orderId: 'ord-1',
            customerId: 'cust-1',
            totalGross: 295
          })
        ],
        total: 1
      })
    })
  })
})
