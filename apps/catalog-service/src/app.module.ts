import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { CorrelationIdInterceptor } from '@distrinorte/shared'

import { HealthModule } from './health/health.module.js'

import { CatalogModule } from './catalog/catalog.module.js'
import { RedisModule } from './redis/redis.module.js'

@Module({
  imports: [RedisModule, HealthModule, CatalogModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor
    }
  ]
})
export class AppModule {}
