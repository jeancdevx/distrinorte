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
  correlationId: string
  createdAt: string
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
    correlationId: string
  ): Promise<OrderRecord> {
    const existing = await this.prisma.db.order.findUnique({
      where: { idempotencyKey },
      include: { lines: true }
    })

    if (existing) {
      return this.toOrderRecord(existing)
    }

    let input: CreateOrderInput

    try {
      input = parseCreateOrderInput(body)
    } catch {
      throw new BadRequestException('Invalid order payload')
    }

    const customer = await this.prisma.db.customer.findUnique({
      where: { id: input.customerId }
    })

    if (!customer) {
      throw new NotFoundException('Customer not found')
    }

    const order = await this.prisma.db.order.create({
      data: {
        customerId: input.customerId,
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

  private toOrderRecord(order: {
    id: string
    status: OrderStatus
    customerId: string
    warehouseId: string
    correlationId: string
    createdAt: Date
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
      correlationId: order.correlationId,
      createdAt: order.createdAt.toISOString()
    }
  }
}
