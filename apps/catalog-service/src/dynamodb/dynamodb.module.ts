import { Module } from '@nestjs/common'

import { AvailabilityRepository } from './availability.repository.js'
import { ProductsRepository } from './products.repository.js'

@Module({
  providers: [ProductsRepository, AvailabilityRepository],
  exports: [ProductsRepository, AvailabilityRepository]
})
export class DynamoDbModule {}
