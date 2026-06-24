import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('orders')
  await app.listen(process.env.PORT ?? 3001)
}

bootstrap()
