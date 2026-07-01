import { OrderStatus } from '@distrinorte/database'
import type { PaginationQuery } from '@distrinorte/shared'

export type ListOrdersQuery = PaginationQuery & {
  status?: OrderStatus
}

const ORDER_STATUSES = new Set<string>(Object.values(OrderStatus))

export function parseListOrdersQuery(query: Record<string, unknown>): {
  status?: OrderStatus
} {
  const rawStatus = query.status

  if (rawStatus === undefined || rawStatus === '') {
    return {}
  }

  if (typeof rawStatus !== 'string' || !ORDER_STATUSES.has(rawStatus)) {
    throw new Error('INVALID_STATUS')
  }

  return { status: rawStatus as OrderStatus }
}
