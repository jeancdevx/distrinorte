resource "aws_sqs_queue_policy" "inventory_work" {
  queue_url = aws_sqs_queue.inventory_work.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowEventBridgeOrderCreated"
        Effect    = "Allow"
        Principal = { Service = "events.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.inventory_work.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_cloudwatch_event_rule.order_created.arn
          }
        }
      },
    ]
  })
}

resource "aws_sqs_queue_policy" "orders_events" {
  queue_url = aws_sqs_queue.orders_events.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowEventBridgeStockReserved"
        Effect    = "Allow"
        Principal = { Service = "events.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.orders_events.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_cloudwatch_event_rule.stock_reserved.arn
          }
        }
      },
      {
        Sid       = "AllowEventBridgeStockRejected"
        Effect    = "Allow"
        Principal = { Service = "events.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.orders_events.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_cloudwatch_event_rule.stock_rejected.arn
          }
        }
      },
    ]
  })
}

resource "aws_sqs_queue_policy" "projections_work" {
  queue_url = aws_sqs_queue.projections_work.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowEventBridgeProjectionEvents"
        Effect    = "Allow"
        Principal = { Service = "events.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.projections_work.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_cloudwatch_event_rule.projection_events.arn
          }
        }
      },
    ]
  })
}
