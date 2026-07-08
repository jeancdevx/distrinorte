import { NestFactory } from '@nestjs/core'
import { Logger } from 'nestjs-pino'

import { AppModule } from './app.module.js'

async function bootstrap() {
  process.env.SERVICE_NAME ??= 'customers-service'

  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))
  app.setGlobalPrefix('customers')
  await app.listen(process.env.PORT ?? 3004)
}

bootstrap()
