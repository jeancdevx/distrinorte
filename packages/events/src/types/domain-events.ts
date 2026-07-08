import type { OrderLine } from './order-line.js'
import type {
  AvailabilityUpdatedEvent,
  CatalogPriceUpdatedEvent,
  CustomerRegisteredEvent,
  CustomerUpdatedEvent
} from './projection-events.js'

export type {
  AvailabilityUpdatedEvent,
  CatalogPriceUpdatedEvent,
  CustomerRegisteredEvent,
  CustomerUpdatedEvent
} from './projection-events.js'

export type OrderLineDetail = OrderLine & {
  unitPriceNet: number
  saleUnit: string
  unitsPerBaseUnit: number
  taxAffectation: string
  lineNet: number
  lineTax: number
  lineGross: number
}

export type OrderCreatedEvent = {
  orderId: string
  customerId: string
  warehouseId: string
  lines: OrderLineDetail[]
  totalNet: number
  totalTax: number
  totalGross: number
  correlationId: string
}

export type FulfillmentOrigin = {
  warehouseId: string
  sku: string
  quantityBase: number
}

export type TransferMatrixSnapshot = {
  fromWarehouseId: string
  toWarehouseId: string
  businessDays: number
  cutoffHour: number
}

export type StockReservedEvent = {
  orderId: string
  reservationId: string
  lines: OrderLine[]
  fulfillment: FulfillmentOrigin[]
  transferDays: number
  transferMatrix: TransferMatrixSnapshot[]
  confirmedAt: string
  correlationId: string
}

export type StockRejectedEvent = {
  orderId: string
  reason: string
  lines: OrderLine[]
  lineDetails?: Array<{
    sku: string
    warehouseId: string
    requiredBase: number
    availableBase: number
  }>
  correlationId: string
}

export type StockPendingTransferEvent = {
  orderId: string
  destinationWarehouseId: string
  transferId: string
  fulfillment: FulfillmentOrigin[]
  correlationId: string
}

export type StockTransferCompletedEvent = {
  orderId: string
  transferId: string
  correlationId: string
}

export type OrderConfirmedLine = OrderLineDetail

export type OrderConfirmedEvent = {
  orderId: string
  customerId: string
  warehouseId: string
  taxId: string
  lines: OrderConfirmedLine[]
  totalNet: number
  totalTax: number
  totalGross: number
  estimatedDeliveryDate: string
  fulfillment: FulfillmentOrigin[]
  correlationId: string
}

export type InvoiceIssuedEvent = {
  orderId: string
  invoiceId: string
  invoiceNumber: string
  pdfKey: string
  correlationId: string
}

export type InvoiceFailedEvent = {
  orderId: string
  reason: string
  correlationId: string
}

export type DomainEvent =
  | OrderCreatedEvent
  | StockReservedEvent
  | StockRejectedEvent
  | StockPendingTransferEvent
  | StockTransferCompletedEvent
  | OrderConfirmedEvent
  | InvoiceIssuedEvent
  | InvoiceFailedEvent
  | CustomerRegisteredEvent
  | CustomerUpdatedEvent
  | CatalogPriceUpdatedEvent
  | AvailabilityUpdatedEvent
