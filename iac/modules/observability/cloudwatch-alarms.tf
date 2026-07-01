locals {
  alarm_actions = [aws_sns_topic.alarms.arn]
}

resource "aws_cloudwatch_metric_alarm" "api_gateway_5xx" {
  alarm_name          = "${local.name_prefix}-api-gateway-5xx"
  alarm_description   = "Errores 5xx en API Gateway REST"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = var.api_5xx_threshold
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.alarm_actions

  dimensions = {
    ApiName = var.api_gateway_name
    Stage   = var.api_gateway_stage
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "api_gateway_latency" {
  alarm_name          = "${local.name_prefix}-api-gateway-latency-p95"
  alarm_description   = "Latencia p95 alta en API Gateway"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = 300
  extended_statistic  = "p95"
  threshold           = 3000
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.alarm_actions

  dimensions = {
    ApiName = var.api_gateway_name
    Stage   = var.api_gateway_stage
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "alb_target_5xx" {
  for_each = var.target_group_arn_suffixes

  alarm_name          = "${local.name_prefix}-alb-${each.key}-target-5xx"
  alarm_description   = "Errores 5xx en target group ${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.alb_target_5xx_threshold
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.alarm_actions

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = each.value
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "sqs_dlq_messages" {
  for_each = var.sqs_dlq_names

  alarm_name          = "${local.name_prefix}-dlq-${each.key}-messages"
  alarm_description   = "Mensajes en DLQ ${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = var.sqs_dlq_message_threshold
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.alarm_actions

  dimensions = {
    QueueName = each.value
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "sqs_queue_depth" {
  for_each = var.sqs_queue_names

  alarm_name          = "${local.name_prefix}-sqs-${each.key}-depth"
  alarm_description   = "Profundidad alta en cola ${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Maximum"
  threshold           = 100
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.alarm_actions

  dimensions = {
    QueueName = each.value
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  for_each = toset(var.ecs_service_names)

  alarm_name          = "${local.name_prefix}-ecs-${each.value}-cpu-high"
  alarm_description   = "CPU alta en servicio ECS ${each.value}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.alarm_actions

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = "${local.name_prefix}-${each.value}"
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "ecs_log_errors" {
  for_each = var.ecs_log_group_names

  alarm_name          = "${local.name_prefix}-ecs-${each.key}-log-errors"
  alarm_description   = "Lineas de error en logs de ${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "${replace(each.key, "-", "_")}_LoggedErrors"
  namespace           = local.metric_namespace
  period              = 300
  statistic           = "Sum"
  threshold           = var.ecs_error_log_threshold
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.alarm_actions

  tags = var.tags
}
