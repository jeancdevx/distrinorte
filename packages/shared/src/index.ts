export {
  COGNITO_CUSTOMER_ID_CLAIM,
  CustomerAuthError,
  extractCustomerIdFromAuthorization
} from './auth/cognito-customer-id.js'
export {
  STOCK_CACHE_RECONCILE_INTERVAL_ENV,
  STOCK_CACHE_TTL_ENV,
  buildStockCacheKey,
  resolveStockCacheReconcileIntervalSeconds,
  resolveStockCacheTtlSeconds
} from './cache/stock-cache.js'
export { HttpHeaders, type HttpHeaderName } from './constants/http-headers.js'
export { CorrelationIdInterceptor } from './correlation/correlation-id.interceptor.js'
export {
  createCorrelationId,
  getCorrelationIdHeaderName,
  resolveCorrelationId
} from './correlation/correlation-id.js'
export { PinoLoggerModule } from './logging/pino-logger.module.js'
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
export {
  calculateLineAmounts,
  calculateOrderTotals,
  isMinimumOrderMet,
  parseTaxAffectation
} from './pricing/calculate.js'
export {
  IGV_RATE,
  MIN_ORDER_GROSS_PEN,
  type LineAmounts,
  type LinePricingInput,
  type OrderTotals,
  type TaxAffectation
} from './pricing/types.js'
export {
  addBusinessDays,
  calculateEstimatedDeliveryDate,
  calculateTransferDays,
  type FulfillmentOrigin,
  type TransferMatrixEntry
} from './eta/estimate-delivery.js'

export const PROJECT_PREFIX = 'distrinorte'
