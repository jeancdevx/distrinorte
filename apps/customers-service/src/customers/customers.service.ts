import {
  BadRequestException,
  ConflictException,
  Injectable
} from '@nestjs/common'

import {
  parseCreateCustomerInput,
  type CreateCustomerInput
} from './dto/create-customer.dto.js'

import { PrismaService } from '../database/prisma.service.js'

export type CustomerRecord = {
  id: string
  name: string
  taxId: string
  email: string
  accountId: string
  createdAt: string
}

export type CustomerListItem = {
  id: string
  name: string
  taxId: string
  createdAt: string
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: unknown): Promise<CustomerRecord> {
    let input: CreateCustomerInput

    try {
      input = parseCreateCustomerInput(body)
    } catch {
      throw new BadRequestException('Invalid customer payload')
    }

    try {
      const customer = await this.prisma.db.customer.create({
        data: {
          name: input.name,
          taxId: input.taxId,
          accounts: {
            create: {
              email: input.email
            }
          }
        },
        include: {
          accounts: {
            take: 1,
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      const account = customer.accounts[0]
      if (!account) {
        throw new Error('Account was not created')
      }

      return {
        id: customer.id,
        name: customer.name,
        taxId: customer.taxId,
        email: account.email,
        accountId: account.id,
        createdAt: customer.createdAt.toISOString()
      }
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(
          'Customer with taxId or email already exists'
        )
      }

      throw error
    }
  }

  async list(
    skip: number,
    take: number
  ): Promise<{
    items: CustomerListItem[]
    total: number
  }> {
    const [items, total] = await Promise.all([
      this.prisma.db.customer.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          taxId: true,
          createdAt: true
        }
      }),
      this.prisma.db.customer.count()
    ])

    return {
      items: items.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString()
      })),
      total
    }
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  )
}
