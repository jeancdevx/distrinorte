resource "aws_dynamodb_table" "products" {
  name         = local.table_name
  billing_mode = var.billing_mode
  hash_key     = "sku"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "sku"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  global_secondary_index {
    name            = local.gsi_category
    projection_type = "ALL"

    key_schema {
      attribute_name = "category"
      key_type       = "HASH"
    }

    key_schema {
      attribute_name = "sku"
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
    Name = local.table_name
  })
}
