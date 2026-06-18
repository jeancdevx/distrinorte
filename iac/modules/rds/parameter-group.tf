resource "aws_db_parameter_group" "main" {
  name_prefix = "${local.name_prefix}-pg17-"
  family      = "postgres17"
  description = "PostgreSQL 17 parameters for ${local.name_prefix}"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-pg17"
  })
}
