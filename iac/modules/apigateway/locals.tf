locals {
  name_prefix = "${var.project_name}-${var.environment}"
  api_name    = "${local.name_prefix}-api"

  services = {
    orders = {
      path = "orders"
    }
    inventory = {
      path = "inventory"
    }
    catalog = {
      path = "catalog"
    }
    customers = {
      path = "customers"
    }
  }
}
