import { Global, Module } from '@nestjs/common'

import { RedisService } from './redis.service.js'
import { StockCacheSyncService } from './stock-cache-sync.service.js'

@Global()
@Module({
  providers: [RedisService, StockCacheSyncService],
  exports: [RedisService, StockCacheSyncService]
})
export class RedisModule {}
