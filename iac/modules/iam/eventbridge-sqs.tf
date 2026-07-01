data "aws_iam_policy_document" "orders_messaging" {
  statement {
    sid    = "PublishOrderEvents"
    effect = "Allow"

    actions = ["events:PutEvents"]

    resources = [var.event_bus_arn]
  }

  statement {
    sid    = "ConsumeOrdersEventsQueue"
    effect = "Allow"

    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility",
    ]

    resources = [var.orders_events_queue_arn]
  }

  statement {
    sid    = "ConsumeProjectionsWorkQueue"
    effect = "Allow"

    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility",
    ]

    resources = [var.projections_work_queue_arn]
  }
}

resource "aws_iam_policy" "orders_messaging" {
  name        = "${local.name_prefix}-orders-messaging"
  description = "EventBridge publish and orders-events SQS consume"
  policy      = data.aws_iam_policy_document.orders_messaging.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-orders-messaging"
    Service = "orders-service"
  })
}

resource "aws_iam_role_policy_attachment" "orders_messaging" {
  role       = aws_iam_role.orders_service.name
  policy_arn = aws_iam_policy.orders_messaging.arn
}

data "aws_iam_policy_document" "inventory_messaging" {
  statement {
    sid    = "PublishInventoryEvents"
    effect = "Allow"

    actions = ["events:PutEvents"]

    resources = [var.event_bus_arn]
  }

  statement {
    sid    = "ConsumeInventoryWorkQueue"
    effect = "Allow"

    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility",
    ]

    resources = [var.inventory_work_queue_arn]
  }
}

resource "aws_iam_policy" "inventory_messaging" {
  name        = "${local.name_prefix}-inventory-messaging"
  description = "EventBridge publish and inventory-work SQS consume"
  policy      = data.aws_iam_policy_document.inventory_messaging.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-inventory-messaging"
    Service = "inventory-service"
  })
}

resource "aws_iam_role_policy_attachment" "inventory_messaging" {
  role       = aws_iam_role.inventory_service.name
  policy_arn = aws_iam_policy.inventory_messaging.arn
}
