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

export function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return withSslQueryParams(process.env.DATABASE_URL)
  }

  const host = process.env.DATABASE_HOST
  const name = process.env.DATABASE_NAME
  const user = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD

  if (host && name && user && password) {
    const port = process.env.DATABASE_PORT ?? '5432'
    const encodedUser = encodeURIComponent(user)
    const encodedPassword = encodeURIComponent(password)

    return withSslQueryParams(
      `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${name}?schema=public`
    )
  }

  return 'postgresql://user:password@localhost:5432/distrinorte?schema=public'
}
