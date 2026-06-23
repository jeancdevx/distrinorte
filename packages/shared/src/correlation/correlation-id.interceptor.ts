import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { Observable } from 'rxjs'

import { HttpHeaders } from '../constants/http-headers.js'
import { resolveCorrelationId } from './correlation-id.js'

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp()
    const request = http.getRequest<{
      headers: Record<string, string | string[] | undefined>
    }>()
    const response = http.getResponse<{
      setHeader: (name: string, value: string) => void
    }>()

    const correlationId = resolveCorrelationId(
      request.headers[HttpHeaders.CorrelationId]
    )

    request.headers[HttpHeaders.CorrelationId] = correlationId
    response.setHeader(HttpHeaders.CorrelationId, correlationId)

    return next.handle()
  }
}
