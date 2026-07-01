import { Injectable, Logger } from '@nestjs/common'

import {
  EventDetailType,
  parseSqsEventBridgeBody,
  type AvailabilityUpdatedEvent,
  type CatalogPriceUpdatedEvent,
  type CustomerRegisteredEvent,
  type CustomerUpdatedEvent
} from '@distrinorte/events'

import { PrismaService } from '../database/prisma.service.js'

const ORDERS_PROJECTION_EVENTS = new Set<string>([
  EventDetailType.CustomerRegistered,
  EventDetailType.CustomerUpdated,
  EventDetailType.CatalogPriceUpdated
])

@Injectable()
export class ProjectionEventsHandler {
  private readonly logger = new Logger(ProjectionEventsHandler.name)

  constructor(private readonly prisma: PrismaService) {}

  isHandledByOrders(detailType: string): boolean {
    return ORDERS_PROJECTION_EVENTS.has(detailType)
  }

  async processMessageBody(body: string): Promise<void> {
    const envelope = parseSqsEventBridgeBody<
      | CustomerRegisteredEvent
      | CustomerUpdatedEvent
      | CatalogPriceUpdatedEvent
      | AvailabilityUpdatedEvent
    >(body)

    if (!this.isHandledByOrders(envelope['detail-type'])) {
      return
    }

    switch (envelope['detail-type']) {
      case EventDetailType.CustomerRegistered:
        await this.upsertCustomerSnapshot(
          envelope.detail as CustomerRegisteredEvent
        )
        return
      case EventDetailType.CustomerUpdated:
        await this.patchCustomerSnapshot(
          envelope.detail as CustomerUpdatedEvent
        )
        return
      case EventDetailType.CatalogPriceUpdated:
        await this.upsertPriceSnapshot(
          envelope.detail as CatalogPriceUpdatedEvent
        )
        return
      default:
        this.logger.warn(
          `Ignoring unsupported event ${envelope['detail-type']}`
        )
    }
  }

  private async upsertCustomerSnapshot(
    detail: CustomerRegisteredEvent
  ): Promise<void> {
    await this.prisma.db.customerSnapshot.upsert({
      where: { customerId: detail.customerId },
      create: {
        customerId: detail.customerId,
        taxId: detail.taxId,
        assignedWarehouseId: detail.assignedWarehouseId,
        status: detail.status
      },
      update: {
        taxId: detail.taxId,
        assignedWarehouseId: detail.assignedWarehouseId,
        status: detail.status
      }
    })
  }

  private async patchCustomerSnapshot(
    detail: CustomerUpdatedEvent
  ): Promise<void> {
    const existing = await this.prisma.db.customerSnapshot.findUnique({
      where: { customerId: detail.customerId }
    })

    if (!existing) {
      await this.prisma.db.customerSnapshot.create({
        data: {
          customerId: detail.customerId,
          taxId: detail.taxId ?? '',
          assignedWarehouseId: detail.assignedWarehouseId ?? 'trujillo',
          status: detail.status ?? 'ACTIVE'
        }
      })
      return
    }

    await this.prisma.db.customerSnapshot.update({
      where: { customerId: detail.customerId },
      data: {
        ...(detail.taxId ? { taxId: detail.taxId } : {}),
        ...(detail.assignedWarehouseId
          ? { assignedWarehouseId: detail.assignedWarehouseId }
          : {}),
        ...(detail.status ? { status: detail.status } : {})
      }
    })
  }

  private async upsertPriceSnapshot(
    detail: CatalogPriceUpdatedEvent
  ): Promise<void> {
    await this.prisma.db.priceSnapshot.upsert({
      where: { sku: detail.sku },
      create: {
        sku: detail.sku,
        unitPriceNet: detail.unitPriceNet,
        saleUnit: detail.saleUnit,
        unitsPerBaseUnit: detail.unitsPerBaseUnit,
        taxAffectation: detail.taxAffectation,
        version: detail.version
      },
      update: {
        unitPriceNet: detail.unitPriceNet,
        saleUnit: detail.saleUnit,
        unitsPerBaseUnit: detail.unitsPerBaseUnit,
        taxAffectation: detail.taxAffectation,
        version: detail.version
      }
    })
  }
}
