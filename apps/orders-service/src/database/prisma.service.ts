import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

import {
  createOrdersPrismaClient,
  type PrismaClient
} from '@distrinorte/database/orders'

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly db: PrismaClient = createOrdersPrismaClient()

  async onModuleInit(): Promise<void> {
    await this.db.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.$disconnect()
  }
}
