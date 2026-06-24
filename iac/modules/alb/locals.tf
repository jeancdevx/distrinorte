locals {
  name_prefix = "${var.project_name}-${var.environment}"

  services = {
    orders = {
      port              = 3001
      path_pattern      = "/orders/*"
      priority          = 100
      health_check_path = "/orders/health"
    }
    inventory = {
      port              = 3002
      path_pattern      = "/inventory/*"
      priority          = 200
      health_check_path = "/inventory/health"
    }
    catalog = {
      port              = 3003
      path_pattern      = "/catalog/*"
      priority          = 300
      health_check_path = "/catalog/health"
    }
    customers = {
      port              = 3004
      path_pattern      = "/customers/*"
      priority          = 400
      health_check_path = "/customers/health"
    }
  }
}
