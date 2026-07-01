resource "aws_sns_topic" "alarms" {
  name = "${local.name_prefix}-alarms"

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-alarms"
  })
}

resource "aws_sns_topic_subscription" "alarm_email" {
  count = var.alarm_email == null ? 0 : 1

  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}
