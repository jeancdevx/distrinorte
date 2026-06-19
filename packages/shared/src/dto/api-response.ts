export type ApiErrorBody = {
  code: string
  message: string
  correlationId?: string
}

export type ApiResponse<T> = {
  data: T
  correlationId?: string
}

export type ApiErrorResponse = {
  error: ApiErrorBody
}

export function ok<T>(data: T, correlationId?: string): ApiResponse<T> {
  return correlationId ? { data, correlationId } : { data }
}

export function fail(
  code: string,
  message: string,
  correlationId?: string
): ApiErrorResponse {
  return {
    error: correlationId ? { code, message, correlationId } : { code, message }
  }
}
