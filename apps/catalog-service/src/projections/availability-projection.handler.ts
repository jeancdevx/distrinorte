import { Injectable, Logger } from '@nestjs/common'

import {
  EventDetailType,
  parseSqsEventBridgeBody,
  type AvailabilityUpdatedEvent
} from '@distrinorte/events'

import { AvailabilityRepository } from '../dynamodb/availability.repository.js'

@Injectable()
export class AvailabilityProjectionHandler {
  private readonly logger = new Logger(AvailabilityProjectionHandler.name)

  constructor(private readonly availability: AvailabilityRepository) {}

  isHandledByCatalog(detailType: string): boolean {
    return detailType === EventDetailType.AvailabilityUpdated
  }

  async processMessageBody(body: string): Promise<void> {
    const envelope = parseSqsEventBridgeBody<AvailabilityUpdatedEvent>(body)

    if (envelope['detail-type'] !== EventDetailType.AvailabilityUpdated) {
      return
    }

    const detail = envelope.detail

    await this.availability.upsertAvailability(
      detail.warehouseId,
      detail.sku,
      detail.availableQty,
      detail.asOf
    )

    this.logger.debug(
      `Updated catalog_availability ${detail.warehouseId}#${detail.sku}=${detail.availableQty}`
    )
  }
}
