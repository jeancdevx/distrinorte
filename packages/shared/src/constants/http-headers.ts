export const HttpHeaders = {
  CorrelationId: 'x-correlation-id',
  IdempotencyKey: 'idempotency-key'
} as const

export type HttpHeaderName = (typeof HttpHeaders)[keyof typeof HttpHeaders]
