import { Module } from '@nestjs/common'

import { DynamoDbModule } from '../dynamodb/dynamodb.module.js'
import { CatalogController } from './catalog.controller.js'
import { CatalogService } from './catalog.service.js'

@Module({
  imports: [DynamoDbModule],
  controllers: [CatalogController],
  providers: [CatalogService]
})
export class CatalogModule {}
