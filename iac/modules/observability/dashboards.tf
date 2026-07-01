locals {
  api_gateway_metrics = [
    ["AWS/ApiGateway", "Count", "ApiName", var.api_gateway_name, "Stage", var.api_gateway_stage],
    [".", "4XXError", ".", ".", ".", "."],
    [".", "5XXError", ".", ".", ".", "."],
    [".", "Latency", ".", ".", ".", ".", { stat = "p95" }],
  ]

  alb_target_5xx_metrics = [
    for key, tg_suffix in var.target_group_arn_suffixes : [
      "AWS/ApplicationELB",
      "HTTPCode_Target_5XX_Count",
      "LoadBalancer",
      var.alb_arn_suffix,
      "TargetGroup",
      tg_suffix,
      { label = key },
    ]
  ]

  alb_healthy_metrics = [
    for key, tg_suffix in var.target_group_arn_suffixes : [
      "AWS/ApplicationELB",
      "HealthyHostCount",
      "LoadBalancer",
      var.alb_arn_suffix,
      "TargetGroup",
      tg_suffix,
      { label = key },
    ]
  ]

  sqs_depth_metrics = concat(
    [
      for key, queue_name in var.sqs_queue_names : [
        "AWS/SQS",
        "ApproximateNumberOfMessagesVisible",
        "QueueName",
        queue_name,
        { label = key },
      ]
    ],
    [
      for key, queue_name in var.sqs_dlq_names : [
        "AWS/SQS",
        "ApproximateNumberOfMessagesVisible",
        "QueueName",
        queue_name,
        { label = "dlq-${key}" },
      ]
    ]
  )

  ecs_cpu_metrics = [
    for service in var.ecs_service_names : [
      "AWS/ECS",
      "CPUUtilization",
      "ClusterName",
      var.ecs_cluster_name,
      "ServiceName",
      "${local.name_prefix}-${service}",
      { label = service },
    ]
  ]

  ecs_error_metrics = [
    for service, _ in var.ecs_log_group_names : [
      local.metric_namespace,
      "${replace(service, "-", "_")}_LoggedErrors",
      { label = service },
    ]
  ]
}

resource "aws_cloudwatch_dashboard" "operations" {
  dashboard_name = "${local.name_prefix}-operations"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title   = "API Gateway"
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          period  = 300
          metrics = local.api_gateway_metrics
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title   = "ALB target 5xx"
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          period  = 300
          metrics = local.alb_target_5xx_metrics
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title   = "ALB healthy hosts"
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          period  = 300
          metrics = local.alb_healthy_metrics
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title   = "SQS depth (work + DLQ)"
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          period  = 300
          metrics = local.sqs_depth_metrics
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6
        properties = {
          title   = "ECS CPU utilization"
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          period  = 300
          metrics = local.ecs_cpu_metrics
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 12
        width  = 12
        height = 6
        properties = {
          title   = "ECS log errors (metric filters)"
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          period  = 300
          metrics = local.ecs_error_metrics
        }
      },
    ]
  })
}
