data "aws_iam_policy_document" "orders_invoices_s3" {
  statement {
    sid    = "PresignInvoicePdfs"
    effect = "Allow"

    actions = [
      "s3:GetObject",
    ]

    resources = ["${var.invoices_bucket_arn}/*"]
  }
}

resource "aws_iam_policy" "orders_invoices_s3" {
  name        = "${local.name_prefix}-orders-invoices-s3"
  description = "Presign read access to invoice PDFs in S3"
  policy      = data.aws_iam_policy_document.orders_invoices_s3.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-orders-invoices-s3"
    Service = "orders-service"
  })
}

resource "aws_iam_role_policy_attachment" "orders_invoices_s3" {
  role       = aws_iam_role.orders_service.name
  policy_arn = aws_iam_policy.orders_invoices_s3.arn
}
