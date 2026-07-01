import { ensureServiceDatabases } from '../../scripts/ensure-service-databases.js'
import { seedCustomers } from './customers.js'
import { seedInventoryDomain } from './inventory.js'

async function main(): Promise<void> {
  await ensureServiceDatabases()
  await seedCustomers()
  await seedInventoryDomain()
  console.log('multi-database demo seed completed')
}

main().catch(error => {
  console.error('multi-database demo seed failed', error)
  process.exit(1)
})
