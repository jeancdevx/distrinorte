export function buildImageUrl(imageKey: string): string {
  const baseUrl = process.env.CATALOG_ASSETS_BASE_URL?.replace(/\/$/, '')

  if (!baseUrl) {
    return `/${imageKey.replace(/^\//, '')}`
  }

  return `${baseUrl}/${imageKey.replace(/^\//, '')}`
}
