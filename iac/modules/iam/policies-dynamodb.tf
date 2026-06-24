data "aws_iam_policy_document" "catalog_dynamodb" {
  statement {
    sid    = "ReadProductsTable"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:BatchGetItem",
      "dynamodb:Query",
      "dynamodb:Scan",
    ]

    resources = [
      var.products_table_arn,
      "${var.products_table_arn}/index/*",
    ]
  }
}

resource "aws_iam_policy" "catalog_dynamodb" {
  name        = "${local.name_prefix}-catalog-dynamodb"
  description = "Read-only access to DynamoDB products table"
  policy      = data.aws_iam_policy_document.catalog_dynamodb.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-catalog-dynamodb"
    Service = "catalog-service"
  })
}

resource "aws_iam_role_policy_attachment" "catalog_dynamodb" {
  role       = aws_iam_role.catalog_service.name
  policy_arn = aws_iam_policy.catalog_dynamodb.arn
}
