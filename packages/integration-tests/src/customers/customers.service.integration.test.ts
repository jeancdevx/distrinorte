import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { CustomersService } from '../../../../apps/customers-service/src/customers/customers.service.js'
import { PrismaService } from '../../../../apps/customers-service/src/database/prisma.service.js'
import {
  disconnectTestPrisma,
  getTestPrisma,
  resetDatabase
} from '../setup/test-database.js'

describe('CustomersService (integration)', () => {
  const prisma = getTestPrisma()
  const service = new CustomersService({ db: prisma } as PrismaService)

  beforeEach(async () => {
    await resetDatabase(prisma)
  })

  afterAll(async () => {
    await disconnectTestPrisma()
  })

  it('persists a customer and account in PostgreSQL', async () => {
    const created = await service.create({
      name: 'Farmacia El Norte',
      taxId: '20111222333',
      email: 'farmacia@elnorte.demo'
    })

    expect(created).toMatchObject({
      name: 'Farmacia El Norte',
      taxId: '20111222333',
      email: 'farmacia@elnorte.demo'
    })

    const stored = await prisma.customer.findUnique({
      where: { id: created.id },
      include: { accounts: true }
    })

    expect(stored?.accounts).toHaveLength(1)
    expect(stored?.accounts[0]?.email).toBe('farmacia@elnorte.demo')
  })

  it('lists customers with pagination totals', async () => {
    await service.create({
      name: 'Cliente A',
      taxId: '20100000001',
      email: 'a@demo.test'
    })
    await service.create({
      name: 'Cliente B',
      taxId: '20100000002',
      email: 'b@demo.test'
    })

    const page = await service.list(0, 10)

    expect(page.total).toBe(2)
    expect(page.items).toHaveLength(2)
    expect(page.items.map(item => item.taxId).sort()).toEqual([
      '20100000001',
      '20100000002'
    ])
  })
})
