export function buildImageUrl(imageKey: string): string {
  const baseUrl =
    process.env.CATALOG_ASSETS_BASE_URL ?? 'https://assets.galaxymorph.com'

  return `${baseUrl.replace(/\/$/, '')}/${imageKey.replace(/^\//, '')}`
}
