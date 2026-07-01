export const HttpHeaders = {
  Authorization: 'authorization',
  CorrelationId: 'x-correlation-id',
  IdempotencyKey: 'idempotency-key'
} as const

export type HttpHeaderName = (typeof HttpHeaders)[keyof typeof HttpHeaders]
