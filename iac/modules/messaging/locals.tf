locals {
  name_prefix = "${var.project_name}-${var.environment}"
  bus_name    = "${local.name_prefix}-bus"

  inventory_work_queue_name = "${local.name_prefix}-inventory-work"
  orders_events_queue_name  = "${local.name_prefix}-orders-events"

  projections_work_queue_name = "${local.name_prefix}-projections-work"

  inventory_work_dlq_name   = "${local.name_prefix}-inventory-work-dlq"
  orders_events_dlq_name    = "${local.name_prefix}-orders-events-dlq"
  projections_work_dlq_name = "${local.name_prefix}-projections-work-dlq"
}
