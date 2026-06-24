import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { Redis, type Redis as RedisClient } from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: RedisClient

  constructor() {
    const host = process.env.REDIS_HOST
    const useTls = process.env.REDIS_TLS === 'true'

    if (!host) {
      throw new Error('REDIS_HOST is required')
    }

    this.client = new Redis({
      host,
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_AUTH_TOKEN,
      ...(useTls ? { tls: {} } : {})
    })
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit()
  }
}
