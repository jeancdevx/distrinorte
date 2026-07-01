export type DatabaseDomain = 'customers' | 'orders' | 'inventory'

export const SERVICE_DATABASE_NAMES: Record<DatabaseDomain, string> = {
  customers: 'customers_db',
  orders: 'orders_db',
  inventory: 'inventory_db'
}

function resolveDatabaseHost(): string | undefined {
  if (process.env.DATABASE_HOST) {
    return process.env.DATABASE_HOST
  }

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    return undefined
  }

  try {
    return new URL(databaseUrl.replace('postgresql://', 'http://')).hostname
  } catch {
    return undefined
  }
}

export function shouldUseDatabaseSsl(): boolean {
  if (process.env.DATABASE_SSL === 'true') {
    return true
  }

  const host = resolveDatabaseHost()

  return host?.includes('rds.amazonaws.com') ?? false
}

export function resolvePgSslConfig():
  | { rejectUnauthorized: false }
  | undefined {
  return shouldUseDatabaseSsl() ? { rejectUnauthorized: false } : undefined
}

function withSslQueryParams(url: string): string {
  if (!shouldUseDatabaseSsl() || url.includes('sslmode=')) {
    return url
  }

  const separator = url.includes('?') ? '&' : '?'

  return `${url}${separator}sslmode=no-verify`
}

function resolveDatabaseName(domain: DatabaseDomain): string {
  const envKey = `DATABASE_NAME_${domain.toUpperCase()}`
  const fromEnv = process.env[envKey]

  if (fromEnv) {
    return fromEnv
  }

  return SERVICE_DATABASE_NAMES[domain]
}

function buildDatabaseUrl(databaseName: string): string {
  const host = process.env.DATABASE_HOST
  const user = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD

  if (host && user && password) {
    const port = process.env.DATABASE_PORT ?? '5432'
    const encodedUser = encodeURIComponent(user)
    const encodedPassword = encodeURIComponent(password)

    return withSslQueryParams(
      `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${databaseName}?schema=public`
    )
  }

  return withSslQueryParams(
    `postgresql://user:password@localhost:5432/${databaseName}?schema=public`
  )
}

export function resolveDatabaseUrl(domain: DatabaseDomain): string {
  const domainUrlKey =
    domain === 'customers'
      ? 'DATABASE_URL_CUSTOMERS'
      : domain === 'orders'
        ? 'DATABASE_URL_ORDERS'
        : 'DATABASE_URL_INVENTORY'

  const domainUrl = process.env[domainUrlKey]

  if (domainUrl) {
    return withSslQueryParams(domainUrl)
  }

  if (!process.env.DATABASE_HOST && process.env.DATABASE_URL) {
    return withSslQueryParams(process.env.DATABASE_URL)
  }

  return buildDatabaseUrl(resolveDatabaseName(domain))
}

export function resolveAdminDatabaseUrl(): string {
  const adminDatabase = process.env.DATABASE_ADMIN_NAME ?? 'postgres'
  return buildDatabaseUrl(adminDatabase)
}
