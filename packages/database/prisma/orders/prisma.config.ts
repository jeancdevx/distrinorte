import { defineConfig } from 'prisma/config'

import { resolveDatabaseUrl } from '../../src/database-url.js'

export default defineConfig({
  schema: 'schema.prisma',
  migrations: {
    path: 'migrations'
  },
  datasource: {
    url: resolveDatabaseUrl('orders')
  }
})
