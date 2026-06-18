resource "aws_sqs_queue" "inventory_work_dlq" {
  name                      = local.inventory_work_dlq_name
  message_retention_seconds = var.dlq_message_retention_seconds
  sqs_managed_sse_enabled   = true

  tags = merge(var.tags, {
    Name = local.inventory_work_dlq_name
  })
}

resource "aws_sqs_queue" "orders_events_dlq" {
  name                      = local.orders_events_dlq_name
  message_retention_seconds = var.dlq_message_retention_seconds
  sqs_managed_sse_enabled   = true

  tags = merge(var.tags, {
    Name = local.orders_events_dlq_name
  })
}
