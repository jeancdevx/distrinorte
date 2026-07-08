import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException
} from '@nestjs/common'

import { OrderStatus, type Prisma } from '@distrinorte/database/orders'
import { EventDetailType, type OrderCreatedEvent } from '@distrinorte/events'
import {
  calculateLineAmounts,
  calculateOrderTotals,
  isMinimumOrderMet,
  parseTaxAffectation
} from '@distrinorte/shared'

import {
  parseCreateOrderInput,
  type CreateOrderInput
} from './dto/create-order.dto.js'

import { PrismaService } from '../database/prisma.service.js'
import { OutboxProcessor } from '../outbox/outbox.processor.js'

export type OrderLineRecord = {
  sku: string
  quantity: number
  unitPriceNet: number
  saleUnit: string
  unitsPerBaseUnit: number
  taxAffectation: string
  lineNet: number
  lineTax: number
  lineGross: number
}

export type OrderRecord = {
  orderId: string
  status: OrderStatus
  customerId: string
  warehouseId: string
  lines: OrderLineRecord[]
  totalNet: number | null
  totalTax: number | null
  totalGross: number | null
  estimatedDeliveryDate: string | null
  invoiceId: string | null
  pdfUrl: string | null
  rejectionReason: string | null
  correlationId: string
  createdAt: string
  updatedAt: string
}

type PricedLine = OrderLineRecord & {
  quantityBase: number
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxProcessor: OutboxProcessor
  ) {}

  async create(
    body: unknown,
    idempotencyKey: string,
    correlationId: string,
    customerId: string
  ): Promise<OrderRecord> {
    const existing = await this.prisma.db.order.findUnique({
      where: { idempotencyKey },
      include: { lines: true }
    })

    if (existing) {
      this.assertOrderOwnership(existing.customerId, customerId)
      return this.toOrderRecord(existing)
    }

    let input: CreateOrderInput

    try {
      input = parseCreateOrderInput(body)
    } catch {
      throw new BadRequestException('Invalid order payload')
    }

    const snapshot = await this.prisma.db.customerSnapshot.findUnique({
      where: { customerId }
    })

    if (!snapshot) {
      throw new ServiceUnavailableException('CUSTOMER_SYNC_PENDING')
    }

    const pricedLines = await this.priceLines(input.lines)
    const totals = calculateOrderTotals(
      pricedLines.map(line => ({
        quantityBase: line.quantityBase,
        lineNet: line.lineNet,
        lineTax: line.lineTax,
        lineGross: line.lineGross
      }))
    )

    if (!isMinimumOrderMet(totals.totalGross)) {
      throw new UnprocessableEntityException('MIN_ORDER_NOT_MET')
    }

    const warehouseId = snapshot.assignedWarehouseId

    const order = await this.prisma.db.$transaction(async tx => {
      const created = await tx.order.create({
        data: {
          customerId,
          warehouseId,
          status: OrderStatus.PENDING,
          totalNet: totals.totalNet,
          totalTax: totals.totalTax,
          totalGross: totals.totalGross,
          idempotencyKey,
          correlationId,
          lines: {
            create: pricedLines.map(line => ({
              sku: line.sku,
              quantity: line.quantity,
              unitPriceNet: line.unitPriceNet,
              saleUnit: line.saleUnit,
              unitsPerBaseUnit: line.unitsPerBaseUnit,
              taxAffectation: line.taxAffectation,
              lineNet: line.lineNet,
              lineTax: line.lineTax,
              lineGross: line.lineGross
            }))
          }
        },
        include: { lines: true }
      })

      const outboxPayload: OrderCreatedEvent = {
        orderId: created.id,
        customerId: created.customerId,
        warehouseId: created.warehouseId,
        lines: created.lines.map(line => this.toOrderLineDetail(line)),
        totalNet: totals.totalNet,
        totalTax: totals.totalTax,
        totalGross: totals.totalGross,
        correlationId
      }

      await tx.outboxEvent.create({
        data: {
          aggregateType: 'order',
          aggregateId: created.id,
          eventType: EventDetailType.OrderCreated,
          payload: outboxPayload as unknown as Prisma.InputJsonValue
        }
      })

      return created
    })

    await this.outboxProcessor.flush()

    return this.toOrderRecord(order)
  }

  async getById(orderId: string, customerId: string): Promise<OrderRecord> {
    const order = await this.prisma.db.order.findFirst({
      where: {
        id: orderId,
        customerId
      },
      include: { lines: true }
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return this.toOrderRecord(order)
  }

  async listByCustomer(
    customerId: string,
    skip: number,
    limit: number,
    status?: OrderStatus
  ): Promise<{ items: OrderRecord[]; total: number }> {
    const where = {
      customerId,
      ...(status ? { status } : {})
    }

    const [orders, total] = await Promise.all([
      this.prisma.db.order.findMany({
        where,
        include: { lines: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.db.order.count({ where })
    ])

    return {
      items: orders.map(order => this.toOrderRecord(order)),
      total
    }
  }

  private async priceLines(
    lines: CreateOrderInput['lines']
  ): Promise<PricedLine[]> {
    const priced: PricedLine[] = []

    for (const line of lines) {
      const snapshot = await this.prisma.db.priceSnapshot.findUnique({
        where: { sku: line.sku }
      })

      if (!snapshot) {
        throw new ServiceUnavailableException(`PRICE_SYNC_PENDING:${line.sku}`)
      }

      const taxAffectation = parseTaxAffectation(snapshot.taxAffectation)
      const amounts = calculateLineAmounts({
        quantity: line.quantity,
        unitPriceNet: Number(snapshot.unitPriceNet),
        unitsPerBaseUnit: snapshot.unitsPerBaseUnit,
        taxAffectation
      })

      priced.push({
        sku: line.sku,
        quantity: line.quantity,
        unitPriceNet: Number(snapshot.unitPriceNet),
        saleUnit: snapshot.saleUnit,
        unitsPerBaseUnit: snapshot.unitsPerBaseUnit,
        taxAffectation,
        lineNet: amounts.lineNet,
        lineTax: amounts.lineTax,
        lineGross: amounts.lineGross,
        quantityBase: amounts.quantityBase
      })
    }

    return priced
  }

  private assertOrderOwnership(
    orderCustomerId: string,
    authenticatedCustomerId: string
  ): void {
    if (orderCustomerId !== authenticatedCustomerId) {
      throw new NotFoundException('Order not found')
    }
  }

  private toOrderLineDetail(line: {
    sku: string
    quantity: number
    unitPriceNet: Prisma.Decimal
    saleUnit: string
    unitsPerBaseUnit: number
    taxAffectation: string
    lineNet: Prisma.Decimal
    lineTax: Prisma.Decimal
    lineGross: Prisma.Decimal
  }) {
    return {
      sku: line.sku,
      quantity: line.quantity,
      unitPriceNet: Number(line.unitPriceNet),
      saleUnit: line.saleUnit,
      unitsPerBaseUnit: line.unitsPerBaseUnit,
      taxAffectation: line.taxAffectation,
      lineNet: Number(line.lineNet),
      lineTax: Number(line.lineTax),
      lineGross: Number(line.lineGross)
    }
  }

  private toOrderRecord(order: {
    id: string
    status: OrderStatus
    customerId: string
    warehouseId: string
    rejectionReason: string | null
    totalNet: Prisma.Decimal | null
    totalTax: Prisma.Decimal | null
    totalGross: Prisma.Decimal | null
    estimatedDeliveryDate: Date | null
    invoiceId: string | null
    pdfUrl: string | null
    correlationId: string
    createdAt: Date
    updatedAt: Date
    lines: Array<{
      sku: string
      quantity: number
      unitPriceNet: Prisma.Decimal
      saleUnit: string
      unitsPerBaseUnit: number
      taxAffectation: string
      lineNet: Prisma.Decimal
      lineTax: Prisma.Decimal
      lineGross: Prisma.Decimal
    }>
  }): OrderRecord {
    return {
      orderId: order.id,
      status: order.status,
      customerId: order.customerId,
      warehouseId: order.warehouseId,
      lines: order.lines.map(line => ({
        sku: line.sku,
        quantity: line.quantity,
        unitPriceNet: Number(line.unitPriceNet),
        saleUnit: line.saleUnit,
        unitsPerBaseUnit: line.unitsPerBaseUnit,
        taxAffectation: line.taxAffectation,
        lineNet: Number(line.lineNet),
        lineTax: Number(line.lineTax),
        lineGross: Number(line.lineGross)
      })),
      totalNet: order.totalNet === null ? null : Number(order.totalNet),
      totalTax: order.totalTax === null ? null : Number(order.totalTax),
      totalGross: order.totalGross === null ? null : Number(order.totalGross),
      estimatedDeliveryDate: order.estimatedDeliveryDate?.toISOString() ?? null,
      invoiceId: order.invoiceId,
      pdfUrl: order.pdfUrl,
      rejectionReason: order.rejectionReason,
      correlationId: order.correlationId,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }
  }
}
