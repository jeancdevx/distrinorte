import { describe, expect, it } from 'vitest'

import { parseCreateCustomerInput } from './create-customer.dto.js'

describe('parseCreateCustomerInput', () => {
  it('parses a valid customer payload', () => {
    expect(
      parseCreateCustomerInput({
        name: ' El Norte ',
        taxId: ' 20123456789 ',
        email: ' demo@elnorte.demo ',
        assignedWarehouseId: ' chiclayo '
      })
    ).toEqual({
      name: 'El Norte',
      taxId: '20123456789',
      email: 'demo@elnorte.demo',
      assignedWarehouseId: 'chiclayo'
    })
  })

  it('rejects invalid email addresses', () => {
    expect(() =>
      parseCreateCustomerInput({
        name: 'El Norte',
        taxId: '20123456789',
        email: 'not-an-email',
        assignedWarehouseId: 'trujillo'
      })
    ).toThrow('INVALID_EMAIL')
  })

  it('requires assignedWarehouseId', () => {
    expect(() =>
      parseCreateCustomerInput({
        name: 'El Norte',
        taxId: '20123456789',
        email: 'demo@elnorte.demo'
      })
    ).toThrow('INVALID_ASSIGNEDWAREHOUSEID')
  })

  it('rejects missing required fields', () => {
    expect(() => parseCreateCustomerInput({})).toThrow('INVALID_NAME')
  })
})
