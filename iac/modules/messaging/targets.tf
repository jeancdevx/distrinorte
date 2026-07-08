resource "aws_cloudwatch_event_target" "order_created_inventory_work" {
  rule           = aws_cloudwatch_event_rule.order_created.name
  event_bus_name = aws_cloudwatch_event_bus.main.name
  target_id      = "inventory-work"
  arn            = aws_sqs_queue.inventory_work.arn
}

resource "aws_cloudwatch_event_target" "stock_reserved_orders_events" {
  rule           = aws_cloudwatch_event_rule.stock_reserved.name
  event_bus_name = aws_cloudwatch_event_bus.main.name
  target_id      = "orders-events"
  arn            = aws_sqs_queue.orders_events.arn
}

resource "aws_cloudwatch_event_target" "stock_rejected_orders_events" {
  rule           = aws_cloudwatch_event_rule.stock_rejected.name
  event_bus_name = aws_cloudwatch_event_bus.main.name
  target_id      = "orders-events"
  arn            = aws_sqs_queue.orders_events.arn
}

resource "aws_cloudwatch_event_target" "order_confirmed_billing_work" {
  rule           = aws_cloudwatch_event_rule.order_confirmed.name
  event_bus_name = aws_cloudwatch_event_bus.main.name
  target_id      = "billing-work"
  arn            = aws_sqs_queue.billing_work.arn
}

resource "aws_cloudwatch_event_target" "orders_lifecycle_events_orders_events" {
  rule           = aws_cloudwatch_event_rule.orders_lifecycle_events.name
  event_bus_name = aws_cloudwatch_event_bus.main.name
  target_id      = "orders-events"
  arn            = aws_sqs_queue.orders_events.arn
}

resource "aws_cloudwatch_event_target" "projection_events_projections_work" {
  rule           = aws_cloudwatch_event_rule.projection_events.name
  event_bus_name = aws_cloudwatch_event_bus.main.name
  target_id      = "projections-work"
  arn            = aws_sqs_queue.projections_work.arn
}
