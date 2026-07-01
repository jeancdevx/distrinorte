import { Injectable, NotFoundException } from '@nestjs/common'

export type CustomerSummary = {
  id: string
  name: string
  taxId: string
}

@Injectable()
export class CustomersClient {
  async getById(customerId: string): Promise<CustomerSummary> {
    const baseUrl = resolveCustomersServiceBaseUrl()
    const response = await fetch(
      `${baseUrl}/${encodeURIComponent(customerId)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }
    )

    if (response.status === 404) {
      throw new NotFoundException('Customer not found')
    }

    if (!response.ok) {
      throw new Error(
        `customers-service responded with status ${response.status}`
      )
    }

    const payload = (await response.json()) as {
      data?: CustomerSummary
    }

    if (!payload.data?.id) {
      throw new Error('Invalid customers-service response')
    }

    return payload.data
  }
}

function resolveCustomersServiceBaseUrl(): string {
  const configured = process.env.CUSTOMERS_SERVICE_URL

  if (configured) {
    return configured.replace(/\/$/, '')
  }

  const port = process.env.CUSTOMERS_SERVICE_PORT ?? '3004'
  return `http://127.0.0.1:${port}/customers`
}
