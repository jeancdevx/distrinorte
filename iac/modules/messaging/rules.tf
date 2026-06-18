resource "aws_cloudwatch_event_rule" "order_created" {
  name           = "${local.name_prefix}-order-created-rule"
  description    = "Route order.created to inventory-work"
  event_bus_name = aws_cloudwatch_event_bus.main.name

  event_pattern = jsonencode({
    source      = [var.event_source]
    detail-type = ["order.created"]
  })

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-order-created-rule"
  })
}

resource "aws_cloudwatch_event_rule" "stock_reserved" {
  name           = "${local.name_prefix}-stock-reserved-rule"
  description    = "Route order.stock_reserved to orders-events"
  event_bus_name = aws_cloudwatch_event_bus.main.name

  event_pattern = jsonencode({
    source      = [var.event_source]
    detail-type = ["order.stock_reserved"]
  })

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-stock-reserved-rule"
  })
}

resource "aws_cloudwatch_event_rule" "stock_rejected" {
  name           = "${local.name_prefix}-stock-rejected-rule"
  description    = "Route order.stock_rejected to orders-events"
  event_bus_name = aws_cloudwatch_event_bus.main.name

  event_pattern = jsonencode({
    source      = [var.event_source]
    detail-type = ["order.stock_rejected"]
  })

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-stock-rejected-rule"
  })
}
