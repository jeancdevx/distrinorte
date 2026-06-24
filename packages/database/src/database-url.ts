export function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const host = process.env.DATABASE_HOST
  const name = process.env.DATABASE_NAME
  const user = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD

  if (host && name && user && password) {
    const port = process.env.DATABASE_PORT ?? '5432'
    const encodedUser = encodeURIComponent(user)
    const encodedPassword = encodeURIComponent(password)

    return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${name}?schema=public`
  }

  return 'postgresql://user:password@localhost:5432/distrinorte?schema=public'
}
