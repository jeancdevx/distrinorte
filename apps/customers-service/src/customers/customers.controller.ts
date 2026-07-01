import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query
} from '@nestjs/common'

import {
  HttpHeaders,
  normalizePagination,
  ok,
  toPaginatedResult,
  type PaginationQuery
} from '@distrinorte/shared'

import { CustomersService } from './customers.service.js'

@Controller()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body() body: unknown,
    @Headers(HttpHeaders.CorrelationId) correlationId?: string
  ) {
    const customer = await this.customersService.create(body, correlationId)

    return ok(customer, correlationId)
  }

  @Get()
  async findAll(
    @Query() query: PaginationQuery,
    @Headers(HttpHeaders.CorrelationId) correlationId?: string
  ) {
    const { page, limit, skip } = normalizePagination(query)
    const { items, total } = await this.customersService.list(skip, limit)

    return ok(toPaginatedResult(items, total, page, limit), correlationId)
  }

  @Get(':customerId')
  async findOne(
    @Param('customerId') customerId: string,
    @Headers(HttpHeaders.CorrelationId) correlationId?: string
  ) {
    const customer = await this.customersService.getById(customerId)
    return ok(customer, correlationId)
  }
}
