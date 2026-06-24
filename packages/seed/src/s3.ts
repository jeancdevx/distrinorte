import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'

import { loadDemoProducts } from './lib/demo-data.js'

const packageDir = dirname(fileURLToPath(import.meta.url))
const placeholderImagePath = join(
  packageDir,
  '../assets/placeholder-product.png'
)

export async function seedCatalogImages(): Promise<void> {
  const bucket = process.env.CATALOG_IMAGES_BUCKET

  if (!bucket) {
    throw new Error('CATALOG_IMAGES_BUCKET is required')
  }

  const region = process.env.AWS_REGION ?? 'us-east-2'
  const client = new S3Client({ region })
  const imageBody = readFileSync(placeholderImagePath)
  const { products } = loadDemoProducts()
  const keys = [...new Set(products.map(product => product.imageKey))]

  let uploaded = 0
  let skipped = 0

  for (const key of keys) {
    const exists = await objectExists(client, bucket, key)

    if (exists) {
      skipped += 1
      continue
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: imageBody,
        ContentType: 'image/png',
        CacheControl: 'public, max-age=86400'
      })
    )

    uploaded += 1
  }

  console.log(
    `S3: ${uploaded} images uploaded, ${skipped} skipped (bucket=${bucket})`
  )
}

async function objectExists(
  client: S3Client,
  bucket: string,
  key: string
): Promise<boolean> {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key
      })
    )

    return true
  } catch (error) {
    if (isNotFoundError(error)) {
      return false
    }

    throw error
  }
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error.name === 'NotFound' || error.name === 'NoSuchKey')
  )
}
