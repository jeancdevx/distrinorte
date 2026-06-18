locals {
  name_prefix          = "${var.project_name}-${var.environment}"
  replication_group_id = "${local.name_prefix}-redis"
}
