resource "aws_cloudwatch_log_metric_filter" "ecs_error" {
  for_each = var.ecs_log_group_names

  name           = "${local.name_prefix}-${each.key}-errors"
  log_group_name = each.value
  pattern        = "?ERROR ?Error ?Exception ?FATAL"

  metric_transformation {
    name          = "${replace(each.key, "-", "_")}_LoggedErrors"
    namespace     = local.metric_namespace
    value         = "1"
    default_value = "0"
  }
}
