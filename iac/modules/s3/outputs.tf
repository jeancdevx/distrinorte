output "portal_spa_bucket_name" {
  description = "Nombre del bucket portal SPA"
  value       = aws_s3_bucket.portal_spa.id
}

output "portal_spa_bucket_arn" {
  description = "ARN del bucket portal SPA"
  value       = aws_s3_bucket.portal_spa.arn
}

output "catalog_images_bucket_name" {
  description = "Nombre del bucket de imagenes de catalogo"
  value       = aws_s3_bucket.catalog_images.id
}

output "catalog_images_bucket_arn" {
  description = "ARN del bucket de imagenes de catalogo"
  value       = aws_s3_bucket.catalog_images.arn
}

output "invoices_bucket_name" {
  description = "Nombre del bucket de facturas PDF"
  value       = aws_s3_bucket.invoices.id
}

output "invoices_bucket_arn" {
  description = "ARN del bucket de facturas PDF"
  value       = aws_s3_bucket.invoices.arn
}

output "backups_bucket_name" {
  description = "Nombre del bucket de backups"
  value       = aws_s3_bucket.backups.id
}

output "backups_bucket_arn" {
  description = "ARN del bucket de backups"
  value       = aws_s3_bucket.backups.arn
}
