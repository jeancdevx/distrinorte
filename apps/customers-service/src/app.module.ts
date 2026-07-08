import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { CorrelationIdInterceptor, PinoLoggerModule } from '@distrinorte/shared'

import { HealthModule } from './health/health.module.js'

import { CustomersModule } from './customers/customers.module.js'
import { DatabaseModule } from './database/database.module.js'

@Module({
  imports: [PinoLoggerModule, DatabaseModule, HealthModule, CustomersModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor
    }
  ]
})
export class AppModule {}
