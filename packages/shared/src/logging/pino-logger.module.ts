import { Module } from '@nestjs/common'
import { LoggerModule } from 'nestjs-pino'

import { HttpHeaders } from '../constants/http-headers.js'

const SENSITIVE_HEADERS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]'
]

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        redact: {
          paths: SENSITIVE_HEADERS,
          remove: true
        },
        customProps: req => {
          const headerValue = req.headers?.[HttpHeaders.CorrelationId]
          const correlationId = Array.isArray(headerValue)
            ? headerValue[0]
            : headerValue

          return {
            service: process.env.SERVICE_NAME ?? 'unknown',
            ...(typeof correlationId === 'string' && correlationId.length > 0
              ? { correlationId }
              : {})
          }
        },
        serializers: {
          req: req => ({
            method: req.method,
            url: req.url,
            correlationId: req.headers?.[HttpHeaders.CorrelationId]
          }),
          res: res => ({
            statusCode: res.statusCode
          })
        },
        transport:
          process.env.LOG_PRETTY === 'true'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard'
                }
              }
            : undefined
      }
    })
  ],
  exports: [LoggerModule]
})
export class PinoLoggerModule {}
