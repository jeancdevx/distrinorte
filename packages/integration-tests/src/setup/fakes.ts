import type {
  AvailabilityUpdatedEvent,
  OrderCreatedEvent,
  StockRejectedEvent,
  StockReservedEvent
} from '@distrinorte/events'

export class FakeEventBridgePublisher {
  readonly orderCreated: OrderCreatedEvent[] = []
  readonly stockReserved: StockReservedEvent[] = []
  readonly stockRejected: StockRejectedEvent[] = []
  readonly availabilityUpdated: AvailabilityUpdatedEvent[] = []

  async publishOrderCreated(detail: OrderCreatedEvent): Promise<void> {
    this.orderCreated.push(detail)
  }

  async publishStockReserved(detail: StockReservedEvent): Promise<void> {
    this.stockReserved.push(detail)
  }

  async publishStockRejected(detail: StockRejectedEvent): Promise<void> {
    this.stockRejected.push(detail)
  }

  async publishAvailabilityUpdated(
    detail: AvailabilityUpdatedEvent
  ): Promise<void> {
    this.availabilityUpdated.push(detail)
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
