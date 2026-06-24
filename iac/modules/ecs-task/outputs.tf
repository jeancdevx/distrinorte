output "task_definition_arn" {
  description = "ARN de la task definition"
  value       = aws_ecs_task_definition.main.arn
}

output "task_definition_family" {
  description = "Familia de la task definition"
  value       = aws_ecs_task_definition.main.family
}

output "log_group_name" {
  description = "CloudWatch log group de la task"
  value       = aws_cloudwatch_log_group.main.name
}
