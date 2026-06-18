output "service_name" {
  description = "Nombre del ECS service"
  value       = aws_ecs_service.main.name
}

output "service_arn" {
  description = "ARN del ECS service"
  value       = aws_ecs_service.main.id
}

output "task_definition_arn" {
  description = "ARN de la task definition activa"
  value       = aws_ecs_task_definition.main.arn
}

output "log_group_name" {
  description = "Nombre del log group CloudWatch"
  value       = aws_cloudwatch_log_group.service.name
}

output "target_group_arn" {
  description = "ARN del target group asociado"
  value       = var.target_group_arn
}
