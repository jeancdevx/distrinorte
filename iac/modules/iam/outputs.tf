output "ecs_task_execution_role_arn" {
  description = "ARN del ECS task execution role compartido"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_execution_role_name" {
  description = "Nombre del ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.name
}

output "customers_task_role_arn" {
  description = "Task role ARN de customers-service"
  value       = aws_iam_role.customers_service.arn
}

output "inventory_task_role_arn" {
  description = "Task role ARN de inventory-service"
  value       = aws_iam_role.inventory_service.arn
}

output "orders_task_role_arn" {
  description = "Task role ARN de orders-service"
  value       = aws_iam_role.orders_service.arn
}

output "catalog_task_role_arn" {
  description = "Task role ARN de catalog-service"
  value       = aws_iam_role.catalog_service.arn
}

output "seed_runner_task_role_arn" {
  description = "Task role ARN de seed-runner"
  value       = aws_iam_role.seed_runner.arn
}

output "invoice_worker_role_arn" {
  description = "Execution role ARN del invoice-worker Lambda"
  value       = try(aws_iam_role.invoice_worker[0].arn, null)
}
