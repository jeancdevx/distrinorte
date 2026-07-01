import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException
} from '@nestjs/common'

import { OrderStatus } from '@distrinorte/database'

import {
  parseCreateOrderInput,
  type CreateOrderInput
} from './dto/create-order.dto.js'

import { PrismaService } from '../database/prisma.service.js'
import { EventBridgePublisher } from '../messaging/eventbridge.publisher.js'

export type OrderRecord = {
  orderId: string
  status: OrderStatus
  customerId: string
  warehouseId: string
  lines: Array<{ sku: string; quantity: number }>
  rejectionReason: string | null
  correlationId: string
  createdAt: string
  updatedAt: string
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBridge: EventBridgePublisher
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

    const customer = await this.prisma.db.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new NotFoundException('Customer not found')
    }

    const order = await this.prisma.db.order.create({
      data: {
        customerId,
        warehouseId: input.warehouseId,
        status: OrderStatus.PENDING,
        idempotencyKey,
        correlationId,
        lines: {
          create: input.lines.map(line => ({
            sku: line.sku,
            quantity: line.quantity
          }))
        }
      },
      include: { lines: true }
    })

    try {
      await this.eventBridge.publishOrderCreated({
        orderId: order.id,
        customerId: order.customerId,
        warehouseId: order.warehouseId,
        lines: order.lines.map(line => ({
          sku: line.sku,
          quantity: line.quantity
        })),
        correlationId
      })
    } catch {
      throw new ServiceUnavailableException(
        'Order persisted but event publication failed'
      )
    }

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

  private assertOrderOwnership(
    orderCustomerId: string,
    authenticatedCustomerId: string
  ): void {
    if (orderCustomerId !== authenticatedCustomerId) {
      throw new NotFoundException('Order not found')
    }
  }

  private toOrderRecord(order: {
    id: string
    status: OrderStatus
    customerId: string
    warehouseId: string
    rejectionReason: string | null
    correlationId: string
    createdAt: Date
    updatedAt: Date
    lines: Array<{ sku: string; quantity: number }>
  }): OrderRecord {
    return {
      orderId: order.id,
      status: order.status,
      customerId: order.customerId,
      warehouseId: order.warehouseId,
      lines: order.lines.map(line => ({
        sku: line.sku,
        quantity: line.quantity
      })),
      rejectionReason: order.rejectionReason,
      correlationId: order.correlationId,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }
  }
}
