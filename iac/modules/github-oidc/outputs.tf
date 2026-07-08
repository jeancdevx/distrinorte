output "deploy_role_arn" {
  description = "ARN del rol IAM que GitHub Actions asume para deploy (secret AWS_DEPLOY_ROLE_ARN)"
  value       = aws_iam_role.github_deploy.arn
}

output "deploy_role_name" {
  description = "Nombre del rol IAM de deploy"
  value       = aws_iam_role.github_deploy.name
}

output "oidc_provider_arn" {
  description = "ARN del proveedor OIDC de GitHub Actions"
  value       = local.oidc_provider_arn
}
