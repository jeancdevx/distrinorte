locals {
  name_prefix                     = "${var.project_name}-${var.environment}"
  table_name                      = "${local.name_prefix}-products"
  gsi_category                    = "category-index"
  catalog_availability_table_name = "${local.name_prefix}-catalog-availability"
  invoices_table_name             = "${local.name_prefix}-invoices"
  invoices_customer_gsi           = "customerId-index"
}
