import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common'

import { resolveStockCacheReconcileIntervalSeconds } from '@distrinorte/shared'

import { PrismaService } from '../database/prisma.service.js'
import { RedisService } from './redis.service.js'
import { queueStockCacheQuantity } from './stock-cache.js'

const REDIS_PIPELINE_BATCH_SIZE = 500

@Injectable()
export class StockCacheSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StockCacheSyncService.name)
  private reconcileTimer: NodeJS.Timeout | undefined

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async onModuleInit(): Promise<void> {
    const warmed = await this.syncFromRds('startup')
    this.logger.log(`Stock cache warm-up completed (${warmed} keys)`)

    const reconcileIntervalSeconds = resolveStockCacheReconcileIntervalSeconds()

    if (reconcileIntervalSeconds) {
      this.reconcileTimer = setInterval(() => {
        void this.syncFromRds('reconciliation').catch(error => {
          this.logger.error(
            'Stock cache reconciliation failed',
            error instanceof Error ? error.stack : String(error)
          )
        })
      }, reconcileIntervalSeconds * 1000)

      this.logger.log(
        `Stock cache reconciliation scheduled every ${reconcileIntervalSeconds}s`
      )
    }
  }

  onModuleDestroy(): void {
    if (this.reconcileTimer) {
      clearInterval(this.reconcileTimer)
    }
  }

  async syncFromRds(
    reason: 'startup' | 'reconciliation' | 'manual'
  ): Promise<number> {
    const rows = await this.prisma.db.inventory.findMany({
      select: { sku: true, warehouseId: true, quantity: true }
    })

    if (rows.length === 0) {
      this.logger.warn(`Stock cache ${reason}: no inventory rows in RDS`)
      return 0
    }

    let keysWritten = 0

    for (
      let offset = 0;
      offset < rows.length;
      offset += REDIS_PIPELINE_BATCH_SIZE
    ) {
      const batch = rows.slice(offset, offset + REDIS_PIPELINE_BATCH_SIZE)
      const pipeline = this.redis.client.pipeline()

      for (const row of batch) {
        queueStockCacheQuantity(
          pipeline,
          row.sku,
          row.warehouseId,
          row.quantity
        )
        keysWritten += 1
      }

      await pipeline.exec()
    }

    this.logger.log(
      `Stock cache ${reason}: synced ${keysWritten} keys from RDS`
    )
    return keysWritten
  }
}
