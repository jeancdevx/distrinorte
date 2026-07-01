output "sns_topic_arn" {
  description = "ARN del topic SNS para alarmas operativas"
  value       = aws_sns_topic.alarms.arn
}

output "dashboard_name" {
  description = "Nombre del dashboard CloudWatch de operaciones"
  value       = aws_cloudwatch_dashboard.operations.dashboard_name
}

output "alarm_names" {
  description = "Nombres de alarmas CloudWatch creadas"
  value = concat(
    [
      aws_cloudwatch_metric_alarm.api_gateway_5xx.alarm_name,
      aws_cloudwatch_metric_alarm.api_gateway_latency.alarm_name,
    ],
    [for alarm in aws_cloudwatch_metric_alarm.alb_target_5xx : alarm.alarm_name],
    [for alarm in aws_cloudwatch_metric_alarm.sqs_dlq_messages : alarm.alarm_name],
    [for alarm in aws_cloudwatch_metric_alarm.sqs_queue_depth : alarm.alarm_name],
    [for alarm in aws_cloudwatch_metric_alarm.ecs_cpu_high : alarm.alarm_name],
    [for alarm in aws_cloudwatch_metric_alarm.ecs_log_errors : alarm.alarm_name],
  )
}
