output "repository_urls" {
  description = "Mapa nombre logico -> URL del repositorio ECR"
  value = {
    for key, repo in aws_ecr_repository.service :
    key => repo.repository_url
  }
}

output "repository_arns" {
  description = "Mapa nombre logico -> ARN del repositorio ECR"
  value = {
    for key, repo in aws_ecr_repository.service :
    key => repo.arn
  }
}

output "registry_id" {
  description = "AWS account ID del registry ECR"
  value       = values(aws_ecr_repository.service)[0].registry_id
}
