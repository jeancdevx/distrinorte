locals {
  name_prefix = "${var.project_name}-${var.environment}"
  pool_name   = "${local.name_prefix}-user-pool"
  domain      = var.user_pool_domain != null ? var.user_pool_domain : local.name_prefix
}
