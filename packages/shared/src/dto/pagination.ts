export type PaginationQuery = {
  page?: number
  limit?: number
}

export type PaginatedResult<T> = {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

export function normalizePagination(query: PaginationQuery): {
  page: number
  limit: number
  skip: number
} {
  const page =
    query.page && query.page > 0 ? Math.floor(query.page) : DEFAULT_PAGE
  const rawLimit =
    query.limit && query.limit > 0 ? Math.floor(query.limit) : DEFAULT_LIMIT
  const limit = Math.min(rawLimit, MAX_LIMIT)

  return {
    page,
    limit,
    skip: (page - 1) * limit
  }
}

export function toPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    items: data,
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit)
  }
}
