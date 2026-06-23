import { randomUUID } from 'node:crypto'

import { HttpHeaders } from '../constants/http-headers.js'

export function createCorrelationId(): string {
  return randomUUID()
}

export function resolveCorrelationId(headerValue?: string | string[]): string {
  if (typeof headerValue === 'string' && headerValue.trim().length > 0) {
    return headerValue.trim()
  }

  if (Array.isArray(headerValue)) {
    const first = headerValue.find(value => value.trim().length > 0)
    if (first) {
      return first.trim()
    }
  }

  return createCorrelationId()
}

export function getCorrelationIdHeaderName(): typeof HttpHeaders.CorrelationId {
  return HttpHeaders.CorrelationId
}
