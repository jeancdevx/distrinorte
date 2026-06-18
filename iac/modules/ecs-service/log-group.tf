resource "aws_cloudwatch_log_group" "service" {
  name              = "/ecs/${local.service_name}"
  retention_in_days = var.log_retention_in_days

  tags = merge(var.tags, {
    Name    = "/ecs/${local.service_name}"
    Service = var.service_name
  })
}
