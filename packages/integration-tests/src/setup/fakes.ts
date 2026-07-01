import { NotFoundException } from '@nestjs/common'

import type { PrismaClient as CustomersPrismaClient } from '@distrinorte/database/customers'
import type {
  OrderCreatedEvent,
  StockRejectedEvent,
  StockReservedEvent
} from '@distrinorte/events'

import type { CustomerSummary } from '../../../../apps/orders-service/src/clients/customers.client.js'

export class DirectCustomersClient {
  constructor(private readonly prisma: CustomersPrismaClient) {}

  async getById(customerId: string): Promise<CustomerSummary> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, taxId: true }
    })

    if (!customer) {
      throw new NotFoundException('Customer not found')
    }

    return customer
  }
}

export class FakeEventBridgePublisher {
  readonly orderCreated: OrderCreatedEvent[] = []
  readonly stockReserved: StockReservedEvent[] = []
  readonly stockRejected: StockRejectedEvent[] = []

  async publishOrderCreated(detail: OrderCreatedEvent): Promise<void> {
    this.orderCreated.push(detail)
  }

  async publishStockReserved(detail: StockReservedEvent): Promise<void> {
    this.stockReserved.push(detail)
  }

  async publishStockRejected(detail: StockRejectedEvent): Promise<void> {
    this.stockRejected.push(detail)
  }
}

export function createInMemoryRedis(): {
  client: {
    get(key: string): Promise<string | null>
    set(key: string, value: string): Promise<string>
  }
  clear: () => void
} {
  const store = new Map<string, string>()

  return {
    clear: () => store.clear(),
    client: {
      async get(key: string) {
        return store.has(key) ? store.get(key)! : null
      },
      async set(key: string, value: string) {
        store.set(key, value)
        return 'OK'
      }
    }
  }
}
