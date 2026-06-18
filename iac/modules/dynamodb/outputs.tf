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
