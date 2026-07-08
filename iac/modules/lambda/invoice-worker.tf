locals {
  name_prefix   = "${var.project_name}-${var.environment}"
  function_name = "${local.name_prefix}-invoice-worker"

  invoice_worker_zip_path = coalesce(
    var.source_zip_path,
    "${path.module}/assets/placeholder.zip",
  )
}

resource "aws_cloudwatch_log_group" "invoice_worker" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = var.log_retention_in_days

  tags = merge(var.tags, {
    Name    = local.function_name
    Service = "invoice-worker"
  })
}

resource "aws_lambda_function" "invoice_worker" {
  function_name = local.function_name
  role          = var.execution_role_arn
  handler       = var.handler
  runtime       = var.runtime
  timeout       = var.timeout_seconds
  memory_size   = var.memory_size

  filename         = local.invoice_worker_zip_path
  source_code_hash = filebase64sha256(local.invoice_worker_zip_path)

  environment {
    variables = {
      NODE_ENV                       = var.environment
      EVENT_BUS_NAME                 = var.event_bus_name
      INVOICES_BUCKET                = var.invoices_bucket_name
      DYNAMODB_INVOICES_TABLE        = var.invoices_table_name
      DYNAMODB_INVOICES_CUSTOMER_GSI = var.invoices_customer_gsi_name
    }
  }

  depends_on = [aws_cloudwatch_log_group.invoice_worker]

  tags = merge(var.tags, {
    Name    = local.function_name
    Service = "invoice-worker"
  })
}

resource "aws_lambda_event_source_mapping" "billing_work" {
  event_source_arn = var.billing_work_queue_arn
  function_name    = aws_lambda_function.invoice_worker.arn
  batch_size       = var.sqs_batch_size
  enabled          = true
}
