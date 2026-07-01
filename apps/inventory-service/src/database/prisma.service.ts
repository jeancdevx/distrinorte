import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

import {
  createInventoryPrismaClient,
  type PrismaClient
} from '@distrinorte/database/inventory'

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly db: PrismaClient = createInventoryPrismaClient()

  async onModuleInit(): Promise<void> {
    await this.db.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.$disconnect()
  }
}
