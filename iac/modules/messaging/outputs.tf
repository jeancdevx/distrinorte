output "event_bus_name" {
  description = "Nombre del custom event bus"
  value       = aws_cloudwatch_event_bus.main.name
}

output "event_bus_arn" {
  description = "ARN del custom event bus"
  value       = aws_cloudwatch_event_bus.main.arn
}

output "inventory_work_queue_url" {
  description = "URL de la cola inventory-work"
  value       = aws_sqs_queue.inventory_work.url
}

output "inventory_work_queue_arn" {
  description = "ARN de la cola inventory-work"
  value       = aws_sqs_queue.inventory_work.arn
}

output "inventory_work_queue_name" {
  description = "Nombre de la cola inventory-work"
  value       = aws_sqs_queue.inventory_work.name
}

output "orders_events_queue_url" {
  description = "URL de la cola orders-events"
  value       = aws_sqs_queue.orders_events.url
}

output "orders_events_queue_arn" {
  description = "ARN de la cola orders-events"
  value       = aws_sqs_queue.orders_events.arn
}

output "orders_events_queue_name" {
  description = "Nombre de la cola orders-events"
  value       = aws_sqs_queue.orders_events.name
}

output "inventory_work_dlq_url" {
  description = "URL de la DLQ inventory-work"
  value       = aws_sqs_queue.inventory_work_dlq.url
}

output "inventory_work_dlq_name" {
  description = "Nombre de la DLQ inventory-work"
  value       = aws_sqs_queue.inventory_work_dlq.name
}

output "orders_events_dlq_url" {
  description = "URL de la DLQ orders-events"
  value       = aws_sqs_queue.orders_events_dlq.url
}

output "orders_events_dlq_name" {
  description = "Nombre de la DLQ orders-events"
  value       = aws_sqs_queue.orders_events_dlq.name
}

output "projections_work_queue_url" {
  description = "URL de la cola projections-work"
  value       = aws_sqs_queue.projections_work.url
}

output "projections_work_queue_arn" {
  description = "ARN de la cola projections-work"
  value       = aws_sqs_queue.projections_work.arn
}

output "projections_work_queue_name" {
  description = "Nombre de la cola projections-work"
  value       = aws_sqs_queue.projections_work.name
}

output "projections_work_dlq_url" {
  description = "URL de la DLQ projections-work"
  value       = aws_sqs_queue.projections_work_dlq.url
}

output "projections_work_dlq_name" {
  description = "Nombre de la DLQ projections-work"
  value       = aws_sqs_queue.projections_work_dlq.name
}
