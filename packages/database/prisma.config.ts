import { defineConfig } from 'prisma/config'

import { resolveDatabaseUrl } from './src/database-url.js'

export default defineConfig({
  schema: 'prisma/customers/schema.prisma',
  migrations: {
    path: 'prisma/customers/migrations',
    seed: 'tsx prisma/seed/index.ts'
  },
  datasource: {
    url: resolveDatabaseUrl('customers')
  }
})
