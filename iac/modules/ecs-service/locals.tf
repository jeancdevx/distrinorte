locals {
  name_prefix  = "${var.project_name}-${var.environment}"
  service_name = "${local.name_prefix}-${var.service_name}"
}
