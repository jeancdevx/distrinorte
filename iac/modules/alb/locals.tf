locals {
  name_prefix = "${var.project_name}-${var.environment}"

  services = {
    orders = {
      port              = 3001
      path_patterns     = ["/orders", "/orders/*"]
      priority          = 100
      health_check_path = "/orders/health"
    }
    inventory = {
      port              = 3002
      path_patterns     = ["/inventory", "/inventory/*"]
      priority          = 200
      health_check_path = "/inventory/health"
    }
    catalog = {
      port              = 3003
      path_patterns     = ["/catalog", "/catalog/*"]
      priority          = 300
      health_check_path = "/catalog/health"
    }
    customers = {
      port              = 3004
      path_patterns     = ["/customers", "/customers/*"]
      priority          = 400
      health_check_path = "/customers/health"
    }
  }
}
