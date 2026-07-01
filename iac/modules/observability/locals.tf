locals {
  name_prefix      = "${var.project_name}-${var.environment}"
  metric_namespace = "DistriNorte/${var.environment}"
}
