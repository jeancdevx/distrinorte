locals {
  name_prefix = "${var.project_name}-${var.environment}"
  identifier  = "${local.name_prefix}-postgres"
}
