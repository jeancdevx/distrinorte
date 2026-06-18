output "user_pool_id" {
  description = "ID del Cognito User Pool"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  description = "ARN del Cognito User Pool"
  value       = aws_cognito_user_pool.main.arn
}

output "user_pool_endpoint" {
  description = "Endpoint del User Pool"
  value       = aws_cognito_user_pool.main.endpoint
}

output "app_client_id" {
  description = "Client ID del SPA"
  value       = aws_cognito_user_pool_client.spa.id
}

output "user_pool_domain" {
  description = "Dominio hosted UI de Cognito"
  value       = aws_cognito_user_pool_domain.main.domain
}

output "hosted_ui_base_url" {
  description = "URL base del hosted UI / OAuth"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "issuer_url" {
  description = "Issuer URL para validacion JWT"
  value       = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
}
