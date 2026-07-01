import { describe, expect, it } from 'vitest'

import {
  COGNITO_CUSTOMER_ID_CLAIM,
  CustomerAuthError,
  extractCustomerIdFromAuthorization
} from './cognito-customer-id.js'

function fakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString(
    'base64url'
  )
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')

  return `${header}.${body}.signature`
}

describe('extractCustomerIdFromAuthorization', () => {
  it('extracts custom:customer_id from a Bearer JWT', () => {
    const token = fakeJwt({
      [COGNITO_CUSTOMER_ID_CLAIM]: '  cust-123  '
    })

    expect(extractCustomerIdFromAuthorization(`Bearer ${token}`)).toBe(
      'cust-123'
    )
  })

  it('throws when Authorization header is missing', () => {
    expect(() => extractCustomerIdFromAuthorization(undefined)).toThrow(
      CustomerAuthError
    )
    expect(() => extractCustomerIdFromAuthorization(undefined)).toThrow(
      'Authorization Bearer token is required'
    )
  })

  it('throws when Bearer token is empty', () => {
    expect(() => extractCustomerIdFromAuthorization('Bearer   ')).toThrow(
      CustomerAuthError
    )
  })

  it('throws when JWT format is invalid', () => {
    expect(() =>
      extractCustomerIdFromAuthorization('Bearer not-a-jwt')
    ).toThrow('Invalid JWT format')
  })

  it('throws when custom:customer_id claim is missing', () => {
    const token = fakeJwt({ sub: 'user-1' })

    expect(() => extractCustomerIdFromAuthorization(`Bearer ${token}`)).toThrow(
      'JWT is missing custom:customer_id claim'
    )
  })
})
