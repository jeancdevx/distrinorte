import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { CorrelationIdInterceptor, PinoLoggerModule } from '@distrinorte/shared'

import { HealthModule } from './health/health.module.js'

import { CatalogModule } from './catalog/catalog.module.js'
import { ProjectionsModule } from './projections/projections.module.js'

@Module({
  imports: [PinoLoggerModule, HealthModule, CatalogModule, ProjectionsModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor
    }
  ]
})
export class AppModule {}
