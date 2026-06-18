output "portal_distribution_id" {
  description = "ID de la distribucion CloudFront del portal"
  value       = aws_cloudfront_distribution.portal.id
}

output "portal_distribution_arn" {
  description = "ARN de la distribucion CloudFront del portal"
  value       = aws_cloudfront_distribution.portal.arn
}

output "portal_distribution_domain_name" {
  description = "Dominio CloudFront del portal"
  value       = aws_cloudfront_distribution.portal.domain_name
}

output "api_distribution_id" {
  description = "ID de la distribucion CloudFront de la API"
  value       = aws_cloudfront_distribution.api.id
}

output "api_distribution_arn" {
  description = "ARN de la distribucion CloudFront de la API"
  value       = aws_cloudfront_distribution.api.arn
}

output "api_distribution_domain_name" {
  description = "Dominio CloudFront de la API"
  value       = aws_cloudfront_distribution.api.domain_name
}

output "assets_distribution_id" {
  description = "ID de la distribucion CloudFront de assets"
  value       = aws_cloudfront_distribution.assets.id
}

output "assets_distribution_arn" {
  description = "ARN de la distribucion CloudFront de assets"
  value       = aws_cloudfront_distribution.assets.arn
}

output "assets_distribution_domain_name" {
  description = "Dominio CloudFront de assets"
  value       = aws_cloudfront_distribution.assets.domain_name
}
