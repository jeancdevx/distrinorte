import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

import { createPrismaClient, type PrismaClient } from '@distrinorte/database'

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly db: PrismaClient = createPrismaClient()

  async onModuleInit(): Promise<void> {
    await this.db.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.$disconnect()
  }
}
