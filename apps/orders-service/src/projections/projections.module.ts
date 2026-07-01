import { Module } from '@nestjs/common'

import { ProjectionEventsHandler } from './projection-events.handler.js'
import { ProjectionsWorkConsumer } from './projections-work.consumer.js'

@Module({
  providers: [ProjectionEventsHandler, ProjectionsWorkConsumer],
  exports: [ProjectionEventsHandler]
})
export class ProjectionsModule {}
