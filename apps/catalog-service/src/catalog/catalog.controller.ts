import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query
} from '@nestjs/common'

import {
  HttpHeaders,
  normalizePagination,
  ok,
  toPaginatedResult,
  type PaginationQuery
} from '@distrinorte/shared'

import { CatalogService } from './catalog.service.js'

type ListProductsQuery = PaginationQuery & {
  warehouseId?: string
  category?: string
}

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  async listProducts(
    @Query() query: ListProductsQuery,
    @Headers(HttpHeaders.CorrelationId) correlationId?: string
  ) {
    if (!query.warehouseId?.trim()) {
      throw new BadRequestException('warehouseId query parameter is required')
    }

    const { page, limit, skip } = normalizePagination(query)
    const { items, total } = await this.catalogService.listProducts(
      query.warehouseId,
      query.category,
      skip,
      limit
    )

    return ok(toPaginatedResult(items, total, page, limit), correlationId)
  }
}
