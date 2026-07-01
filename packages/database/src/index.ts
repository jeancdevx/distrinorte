export {
  createCustomersPrismaClient,
  createPrismaClient as createCustomersPrismaClientAlias
} from './customers.js'

export {
  createOrdersPrismaClient,
  createPrismaClient as createOrdersPrismaClientAlias,
  OrderStatus
} from './orders.js'

export {
  createInventoryPrismaClient,
  createPrismaClient as createInventoryPrismaClientAlias
} from './inventory.js'

export {
  resolveAdminDatabaseUrl,
  resolveDatabaseUrl,
  resolvePgSslConfig,
  SERVICE_DATABASE_NAMES,
  shouldUseDatabaseSsl,
  type DatabaseDomain
} from './database-url.js'

export { createOrdersPrismaClient as createPrismaClient } from './orders.js'
