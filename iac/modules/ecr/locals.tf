locals {
  name_prefix = "${var.project_name}-${var.environment}"

  repositories = toset([
    "customers-service",
    "inventory-service",
    "orders-service",
    "catalog-service",
    "seed-runner",
  ])
}
