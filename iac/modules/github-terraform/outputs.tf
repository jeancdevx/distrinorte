output "terraform_apply_role_arn" {
  description = "ARN del rol IAM para terraform apply en GitHub Actions (secret AWS_TERRAFORM_APPLY_ROLE_ARN)"
  value       = aws_iam_role.terraform_apply.arn
}

output "terraform_apply_role_name" {
  description = "Nombre del rol IAM de terraform apply"
  value       = aws_iam_role.terraform_apply.name
}

output "oidc_provider_arn" {
  description = "ARN del proveedor OIDC de GitHub Actions"
  value       = local.oidc_provider_arn
}
