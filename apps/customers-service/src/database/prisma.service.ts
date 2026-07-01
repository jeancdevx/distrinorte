import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

import {
  createCustomersPrismaClient,
  type PrismaClient
} from '@distrinorte/database/customers'

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly db: PrismaClient = createCustomersPrismaClient()

  async onModuleInit(): Promise<void> {
    await this.db.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.$disconnect()
  }
}
