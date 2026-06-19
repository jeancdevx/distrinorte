export { HttpHeaders, type HttpHeaderName } from './constants/http-headers.js'
export { CorrelationIdInterceptor } from './correlation/correlation-id.interceptor.js'
export {
  createCorrelationId,
  getCorrelationIdHeaderName,
  resolveCorrelationId
} from './correlation/correlation-id.js'
export {
  fail,
  ok,
  type ApiErrorBody,
  type ApiErrorResponse,
  type ApiResponse
} from './dto/api-response.js'
export { isValidOrderLine, type OrderLineInput } from './dto/order-line.js'
export {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  normalizePagination,
  toPaginatedResult,
  type PaginatedResult,
  type PaginationQuery
} from './dto/pagination.js'

export const PROJECT_PREFIX = 'distrinorte'
