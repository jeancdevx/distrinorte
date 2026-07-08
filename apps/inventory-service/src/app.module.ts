import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { CorrelationIdInterceptor, PinoLoggerModule } from '@distrinorte/shared'

import { HealthModule } from './health/health.module.js'

import { DatabaseModule } from './database/database.module.js'
import { InventoryModule } from './inventory/inventory.module.js'
import { RedisModule } from './redis/redis.module.js'

@Module({
  imports: [
    PinoLoggerModule,
    DatabaseModule,
    RedisModule,
    HealthModule,
    InventoryModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor
    }
  ]
})
export class AppModule {}
