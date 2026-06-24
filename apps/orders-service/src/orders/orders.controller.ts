import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Post
} from '@nestjs/common'

import { HttpHeaders, ok, resolveCorrelationId } from '@distrinorte/shared'

import { OrdersService } from './orders.service.js'

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(202)
  async create(
    @Body() body: unknown,
    @Headers(HttpHeaders.IdempotencyKey) idempotencyKey: string | undefined,
    @Headers(HttpHeaders.CorrelationId) correlationHeader?: string | string[]
  ) {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('Idempotency-Key header is required')
    }

    const correlationId = resolveCorrelationId(correlationHeader)
    const order = await this.ordersService.create(
      body,
      idempotencyKey.trim(),
      correlationId
    )

    return ok(order, correlationId)
  }
}
