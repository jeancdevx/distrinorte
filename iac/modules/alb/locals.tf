locals {
  name_prefix = "${var.project_name}-${var.environment}"

  services = {
    orders = {
      port         = 3001
      path_pattern = "/orders/*"
      priority     = 100
    }
    inventory = {
      port         = 3002
      path_pattern = "/inventory/*"
      priority     = 200
    }
    catalog = {
      port         = 3003
      path_pattern = "/catalog/*"
      priority     = 300
    }
    customers = {
      port         = 3004
      path_pattern = "/customers/*"
      priority     = 400
    }
  }
}
