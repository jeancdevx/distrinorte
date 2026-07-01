resource "aws_iam_role" "seed_runner" {
  name               = "${local.name_prefix}-seed-runner-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-seed-runner-task"
    Service = "seed-runner"
  })
}

data "aws_iam_policy_document" "seed_runner" {
  statement {
    sid    = "WriteProductsTable"
    effect = "Allow"

    actions = [
      "dynamodb:BatchWriteItem",
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:Scan",
    ]

    resources = [
      var.products_table_arn,
      "${var.products_table_arn}/index/*",
    ]
  }

  dynamic "statement" {
    for_each = var.catalog_images_bucket_arn != null ? [1] : []

    content {
      sid    = "WriteCatalogImages"
      effect = "Allow"

      actions = [
        "s3:ListBucket",
        "s3:PutObject",
        "s3:HeadObject",
        "s3:GetObject",
      ]

      resources = [
        var.catalog_images_bucket_arn,
        "${var.catalog_images_bucket_arn}/*",
      ]
    }
  }

  statement {
    sid    = "PublishProjectionEvents"
    effect = "Allow"

    actions = ["events:PutEvents"]

    resources = [var.event_bus_arn]
  }

  dynamic "statement" {
    for_each = var.catalog_availability_table_arn != null ? [1] : []

    content {
      sid    = "WriteCatalogAvailability"
      effect = "Allow"

      actions = [
        "dynamodb:PutItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:UpdateItem",
      ]

      resources = [var.catalog_availability_table_arn]
    }
  }
}

resource "aws_iam_policy" "seed_runner" {
  name        = "${local.name_prefix}-seed-runner"
  description = "Seed runner: DynamoDB products + S3 catalog images"
  policy      = data.aws_iam_policy_document.seed_runner.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-seed-runner"
    Service = "seed-runner"
  })
}

resource "aws_iam_role_policy_attachment" "seed_runner" {
  role       = aws_iam_role.seed_runner.name
  policy_arn = aws_iam_policy.seed_runner.arn
}
