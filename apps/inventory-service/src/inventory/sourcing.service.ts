import { Injectable } from '@nestjs/common'

import type { OrderLineDetail } from '@distrinorte/events'
import type { FulfillmentOrigin } from '@distrinorte/shared'

export type SourcingLinePlan = {
  sku: string
  requiredBase: number
  localBase: number
  transfers: Array<{ fromWarehouseId: string; quantityBase: number }>
}

export type SourcingPlan = {
  destinationWarehouseId: string
  lines: SourcingLinePlan[]
  requiresTransfer: boolean
  fulfillment: FulfillmentOrigin[]
}

export type SourcingFailure = {
  ok: false
  reason: string
  lineDetails: Array<{
    sku: string
    warehouseId: string
    requiredBase: number
    availableBase: number
  }>
}

export type SourcingSuccess = {
  ok: true
  plan: SourcingPlan
}

export type SourcingResult = SourcingSuccess | SourcingFailure

const ORIGIN_PRIORITY = [
  'trujillo',
  'paijan',
  'chiclayo',
  'piura',
  'cajamarca'
] as const

@Injectable()
export class SourcingService {
  buildRequiredBase(line: OrderLineDetail): number {
    return line.quantity * line.unitsPerBaseUnit
  }

  async planOrder(
    destinationWarehouseId: string,
    lines: OrderLineDetail[],
    loadAvailable: (sku: string, warehouseId: string) => Promise<number | null>
  ): Promise<SourcingResult> {
    const planLines: SourcingLinePlan[] = []
    const failures: SourcingFailure['lineDetails'] = []

    for (const line of lines) {
      const requiredBase = this.buildRequiredBase(line)
      const availableLocal =
        (await loadAvailable(line.sku, destinationWarehouseId)) ?? 0
      const localBase = Math.min(availableLocal, requiredBase)
      const deficit = requiredBase - localBase
      const transfers: Array<{
        fromWarehouseId: string
        quantityBase: number
      }> = []

      if (deficit > 0) {
        let remaining = deficit

        for (const originId of ORIGIN_PRIORITY) {
          if (originId === destinationWarehouseId || remaining <= 0) {
            continue
          }

          const availableOrigin = (await loadAvailable(line.sku, originId)) ?? 0
          if (availableOrigin <= 0) {
            continue
          }

          const allocated = Math.min(availableOrigin, remaining)
          transfers.push({
            fromWarehouseId: originId,
            quantityBase: allocated
          })
          remaining -= allocated
        }

        if (remaining > 0) {
          failures.push({
            sku: line.sku,
            warehouseId: destinationWarehouseId,
            requiredBase,
            availableBase: availableLocal
          })
          continue
        }
      }

      planLines.push({
        sku: line.sku,
        requiredBase,
        localBase,
        transfers
      })
    }

    if (failures.length > 0) {
      return {
        ok: false,
        reason: `Insufficient network stock for ${failures[0]?.sku ?? 'order'}`,
        lineDetails: failures
      }
    }

    const fulfillment: FulfillmentOrigin[] = []

    for (const line of planLines) {
      if (line.localBase > 0) {
        fulfillment.push({
          warehouseId: destinationWarehouseId,
          sku: line.sku,
          quantityBase: line.localBase
        })
      }

      for (const transfer of line.transfers) {
        fulfillment.push({
          warehouseId: transfer.fromWarehouseId,
          sku: line.sku,
          quantityBase: transfer.quantityBase
        })
      }
    }

    const requiresTransfer = planLines.some(line => line.transfers.length > 0)

    return {
      ok: true,
      plan: {
        destinationWarehouseId,
        lines: planLines,
        requiresTransfer,
        fulfillment
      }
    }
  }
}
