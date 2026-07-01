data "aws_iam_policy_document" "customers_messaging" {
  statement {
    sid    = "PublishCustomerEvents"
    effect = "Allow"

    actions = ["events:PutEvents"]

    resources = [var.event_bus_arn]
  }
}

resource "aws_iam_policy" "customers_messaging" {
  name        = "${local.name_prefix}-customers-messaging"
  description = "EventBridge publish for customer projection events"
  policy      = data.aws_iam_policy_document.customers_messaging.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-customers-messaging"
    Service = "customers-service"
  })
}

resource "aws_iam_role_policy_attachment" "customers_messaging" {
  role       = aws_iam_role.customers_service.name
  policy_arn = aws_iam_policy.customers_messaging.arn
}

data "aws_iam_policy_document" "catalog_messaging" {
  statement {
    sid    = "PublishCatalogEvents"
    effect = "Allow"

    actions = ["events:PutEvents"]

    resources = [var.event_bus_arn]
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

resource "aws_iam_policy" "catalog_messaging" {
  name        = "${local.name_prefix}-catalog-messaging"
  description = "EventBridge publish and projections-work consume for catalog-service"
  policy      = data.aws_iam_policy_document.catalog_messaging.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-catalog-messaging"
    Service = "catalog-service"
  })
}

resource "aws_iam_role_policy_attachment" "catalog_messaging" {
  role       = aws_iam_role.catalog_service.name
  policy_arn = aws_iam_policy.catalog_messaging.arn
}
