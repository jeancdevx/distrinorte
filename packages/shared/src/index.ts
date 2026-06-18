import { randomUUID } from 'node:crypto'

export const PROJECT_PREFIX = 'distrinorte'

export function createCorrelationId(): string {
  return randomUUID()
}
