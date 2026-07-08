output "invoice_worker_function_name" {
  description = "Nombre de la funcion invoice-worker"
  value       = aws_lambda_function.invoice_worker.function_name
}

output "invoice_worker_function_arn" {
  description = "ARN de la funcion invoice-worker"
  value       = aws_lambda_function.invoice_worker.arn
}

output "invoice_worker_log_group_name" {
  description = "CloudWatch log group del invoice-worker"
  value       = aws_cloudwatch_log_group.invoice_worker.name
}
