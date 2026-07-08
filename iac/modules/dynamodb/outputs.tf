output "products_table_name" {
  description = "Nombre de la tabla DynamoDB products"
  value       = aws_dynamodb_table.products.name
}

output "products_table_arn" {
  description = "ARN de la tabla DynamoDB products"
  value       = aws_dynamodb_table.products.arn
}

output "products_category_gsi_name" {
  description = "Nombre del GSI por categoria"
  value       = local.gsi_category
}

output "catalog_availability_table_name" {
  description = "Nombre de la tabla DynamoDB catalog_availability"
  value       = aws_dynamodb_table.catalog_availability.name
}

output "catalog_availability_table_arn" {
  description = "ARN de la tabla DynamoDB catalog_availability"
  value       = aws_dynamodb_table.catalog_availability.arn
}

output "invoices_table_name" {
  description = "Nombre de la tabla DynamoDB invoices"
  value       = aws_dynamodb_table.invoices.name
}

output "invoices_table_arn" {
  description = "ARN de la tabla DynamoDB invoices"
  value       = aws_dynamodb_table.invoices.arn
}

output "invoices_customer_gsi_name" {
  description = "Nombre del GSI por customerId en invoices"
  value       = local.invoices_customer_gsi
}
