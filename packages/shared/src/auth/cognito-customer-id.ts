export const COGNITO_CUSTOMER_ID_CLAIM = 'custom:customer_id'

export class CustomerAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CustomerAuthError'
  }
}

export function extractCustomerIdFromAuthorization(
  authorizationHeader: string | undefined
): string {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw new CustomerAuthError('Authorization Bearer token is required')
  }

  const token = authorizationHeader.slice('Bearer '.length).trim()

  if (!token) {
    throw new CustomerAuthError('Authorization Bearer token is required')
  }

  const payload = decodeJwtPayload(token)
  const customerId = payload[COGNITO_CUSTOMER_ID_CLAIM]

  if (typeof customerId !== 'string' || customerId.trim().length === 0) {
    throw new CustomerAuthError('JWT is missing custom:customer_id claim')
  }

  return customerId.trim()
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.')

  if (parts.length !== 3) {
    throw new CustomerAuthError('Invalid JWT format')
  }

  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8')
    const payload = JSON.parse(json)

    if (typeof payload !== 'object' || payload === null) {
      throw new CustomerAuthError('Invalid JWT payload')
    }

    return payload as Record<string, unknown>
  } catch (error) {
    if (error instanceof CustomerAuthError) {
      throw error
    }

    throw new CustomerAuthError('Invalid JWT payload')
  }
}
