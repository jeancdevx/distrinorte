resource "aws_dynamodb_table" "catalog_availability" {
  name         = local.catalog_availability_table_name
  billing_mode = var.billing_mode
  hash_key     = "warehouseSku"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "warehouseSku"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  server_side_encryption {
    enabled = var.enable_encryption
  }

  deletion_protection_enabled = var.deletion_protection

  tags = merge(var.tags, {
    Name = local.catalog_availability_table_name
  })
}
