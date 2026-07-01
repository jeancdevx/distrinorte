import { describe, expect, it } from 'vitest'

import { parseCreateCustomerInput } from './create-customer.dto.js'

describe('parseCreateCustomerInput', () => {
  it('parses a valid customer payload', () => {
    expect(
      parseCreateCustomerInput({
        name: ' El Norte ',
        taxId: ' 20123456789 ',
        email: ' demo@elnorte.demo '
      })
    ).toEqual({
      name: 'El Norte',
      taxId: '20123456789',
      email: 'demo@elnorte.demo'
    })
  })

  it('rejects invalid email addresses', () => {
    expect(() =>
      parseCreateCustomerInput({
        name: 'El Norte',
        taxId: '20123456789',
        email: 'not-an-email'
      })
    ).toThrow('INVALID_EMAIL')
  })

  it('rejects missing required fields', () => {
    expect(() => parseCreateCustomerInput({})).toThrow('INVALID_NAME')
  })
})
