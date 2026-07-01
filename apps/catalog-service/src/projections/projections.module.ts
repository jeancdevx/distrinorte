import { Module } from '@nestjs/common'

import { DynamoDbModule } from '../dynamodb/dynamodb.module.js'
import { AvailabilityProjectionHandler } from './availability-projection.handler.js'
import { ProjectionsWorkConsumer } from './projections-work.consumer.js'

@Module({
  imports: [DynamoDbModule],
  providers: [AvailabilityProjectionHandler, ProjectionsWorkConsumer]
})
export class ProjectionsModule {}
