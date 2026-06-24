import { seedDynamoDbProducts } from './dynamodb.js'
import { warmRedisStockFromRds } from './redis.js'
import { seedCatalogImages } from './s3.js'

type SeedStep = 'all' | 'dynamodb' | 's3' | 'redis'

async function main(): Promise<void> {
  const step = resolveStep(process.argv)

  if (step === 'all' || step === 'dynamodb') {
    await seedDynamoDbProducts()
  }

  if (step === 'all' || step === 's3') {
    await seedCatalogImages()
  }

  if (step === 'all' || step === 'redis') {
    await warmRedisStockFromRds()
  }

  console.log(`AWS demo seed completed (step=${step})`)
}

function resolveStep(argv: string[]): SeedStep {
  const onlyFlagIndex = argv.indexOf('--only')

  if (onlyFlagIndex === -1) {
    return 'all'
  }

  const value = argv[onlyFlagIndex + 1]

  if (
    value === 'all' ||
    value === 'dynamodb' ||
    value === 's3' ||
    value === 'redis'
  ) {
    return value
  }

  throw new Error('Invalid --only value. Use: all | dynamodb | s3 | redis')
}

main().catch(error => {
  console.error('AWS demo seed failed', error)
  process.exit(1)
})
