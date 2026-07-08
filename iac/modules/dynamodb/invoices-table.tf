resource "aws_dynamodb_table" "invoices" {
  name         = local.invoices_table_name
  billing_mode = var.billing_mode
  hash_key     = "orderId"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "customerId"
    type = "S"
  }

  global_secondary_index {
    name            = local.invoices_customer_gsi
    projection_type = "ALL"

    key_schema {
      attribute_name = "customerId"
      key_type       = "HASH"
    }

    key_schema {
      attribute_name = "orderId"
      key_type       = "RANGE"
    }

    read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
    write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  server_side_encryption {
    enabled = var.enable_encryption
  }

  deletion_protection_enabled = var.deletion_protection

  tags = merge(var.tags, {
    Name = local.invoices_table_name
  })
}
