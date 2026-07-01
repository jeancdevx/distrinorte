import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  UnauthorizedException
} from '@nestjs/common'

import {
  CustomerAuthError,
  HttpHeaders,
  extractCustomerIdFromAuthorization,
  normalizePagination,
  ok,
  resolveCorrelationId,
  toPaginatedResult
} from '@distrinorte/shared'

import { parseListOrdersQuery } from './dto/list-orders.dto.js'

import { OrdersService } from './orders.service.js'

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(202)
  async create(
    @Body() body: unknown,
    @Headers(HttpHeaders.Authorization) authorization: string | undefined,
    @Headers(HttpHeaders.IdempotencyKey) idempotencyKey: string | undefined,
    @Headers(HttpHeaders.CorrelationId) correlationHeader?: string | string[]
  ) {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('Idempotency-Key header is required')
    }

    const customerId = this.resolveAuthenticatedCustomerId(authorization)
    const correlationId = resolveCorrelationId(correlationHeader)
    const order = await this.ordersService.create(
      body,
      idempotencyKey.trim(),
      correlationId,
      customerId
    )

    return ok(order, correlationId)
  }

  @Get()
  async list(
    @Query() query: Record<string, unknown>,
    @Headers(HttpHeaders.Authorization) authorization: string | undefined,
    @Headers(HttpHeaders.CorrelationId) correlationHeader?: string | string[]
  ) {
    const customerId = this.resolveAuthenticatedCustomerId(authorization)
    const { page, limit, skip } = normalizePagination(query)

    let statusFilter: ReturnType<typeof parseListOrdersQuery>['status']

    try {
      statusFilter = parseListOrdersQuery(query).status
    } catch {
      throw new BadRequestException('Invalid status filter')
    }

    const { items, total } = await this.ordersService.listByCustomer(
      customerId,
      skip,
      limit,
      statusFilter
    )

    return ok(
      toPaginatedResult(items, total, page, limit),
      resolveCorrelationId(correlationHeader)
    )
  }

  @Get(':orderId')
  async getById(
    @Param('orderId') orderId: string,
    @Headers(HttpHeaders.Authorization) authorization: string | undefined,
    @Headers(HttpHeaders.CorrelationId) correlationHeader?: string | string[]
  ) {
    const customerId = this.resolveAuthenticatedCustomerId(authorization)
    const order = await this.ordersService.getById(orderId.trim(), customerId)

    return ok(order, resolveCorrelationId(correlationHeader))
  }

  private resolveAuthenticatedCustomerId(
    authorization: string | undefined
  ): string {
    try {
      return extractCustomerIdFromAuthorization(authorization)
    } catch (error) {
      const message =
        error instanceof CustomerAuthError
          ? error.message
          : 'Valid Authorization Bearer token required'

      throw new UnauthorizedException(message)
    }
  }
}
