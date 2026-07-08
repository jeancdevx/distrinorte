import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { CorrelationIdInterceptor, PinoLoggerModule } from '@distrinorte/shared'

import { HealthModule } from './health/health.module.js'

import { DatabaseModule } from './database/database.module.js'
import { OrdersModule } from './orders/orders.module.js'

@Module({
  imports: [PinoLoggerModule, DatabaseModule, HealthModule, OrdersModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor
    }
  ]
})
export class AppModule {}
