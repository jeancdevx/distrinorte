locals {
  create_invoice_worker_iam = (
    var.invoices_bucket_arn != null
    && var.invoices_table_arn != null
    && var.billing_work_queue_arn != null
  )
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "invoice_worker" {
  count = local.create_invoice_worker_iam ? 1 : 0

  name               = "${local.name_prefix}-invoice-worker"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-invoice-worker"
    Service = "invoice-worker"
  })
}

resource "aws_iam_role_policy_attachment" "invoice_worker_basic" {
  count = local.create_invoice_worker_iam ? 1 : 0

  role       = aws_iam_role.invoice_worker[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "invoice_worker" {
  count = local.create_invoice_worker_iam ? 1 : 0

  statement {
    sid    = "ReadWriteInvoicesBucket"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:HeadObject",
    ]

    resources = ["${var.invoices_bucket_arn}/*"]
  }

  statement {
    sid    = "ReadWriteInvoicesTable"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:Query",
    ]

    resources = [
      var.invoices_table_arn,
      "${var.invoices_table_arn}/index/*",
    ]
  }

  statement {
    sid    = "PublishInvoiceEvents"
    effect = "Allow"

    actions = ["events:PutEvents"]

    resources = [var.event_bus_arn]
  }

  statement {
    sid    = "ConsumeBillingWorkQueue"
    effect = "Allow"

    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility",
    ]

    resources = [var.billing_work_queue_arn]
  }
}

resource "aws_iam_policy" "invoice_worker" {
  count = local.create_invoice_worker_iam ? 1 : 0

  name        = "${local.name_prefix}-invoice-worker"
  description = "Invoice worker: S3 invoices, DynamoDB invoices, EventBridge publish, billing-work consume"
  policy      = data.aws_iam_policy_document.invoice_worker[0].json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-invoice-worker"
    Service = "invoice-worker"
  })
}

resource "aws_iam_role_policy_attachment" "invoice_worker" {
  count = local.create_invoice_worker_iam ? 1 : 0

  role       = aws_iam_role.invoice_worker[0].name
  policy_arn = aws_iam_policy.invoice_worker[0].arn
}
