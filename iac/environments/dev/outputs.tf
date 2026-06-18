output "aws_region" {
  value = var.aws_region
}

output "name_prefix" {
  value = local.name_prefix
}

output "vpc_id" {
  description = "ID de la VPC"
  value       = module.networking.vpc_id
}

output "private_subnet_ids" {
  description = "IDs de subnets privadas"
  value       = module.networking.private_subnet_ids
}

output "data_subnet_ids" {
  description = "IDs de subnets de datos"
  value       = module.networking.data_subnet_ids
}

output "alb_sg_id" {
  description = "Security group del ALB interno"
  value       = module.security_groups.alb_sg_id
}

output "ecs_sg_id" {
  description = "Security group de tasks ECS"
  value       = module.security_groups.ecs_sg_id
}

output "portal_spa_bucket_name" {
  description = "Bucket portal SPA"
  value       = module.s3.portal_spa_bucket_name
}

output "catalog_images_bucket_name" {
  description = "Bucket imagenes de catalogo"
  value       = module.s3.catalog_images_bucket_name
}

output "backups_bucket_name" {
  description = "Bucket de backups"
  value       = module.s3.backups_bucket_name
}

output "products_table_name" {
  description = "Tabla DynamoDB products"
  value       = module.dynamodb.products_table_name
}

output "products_table_arn" {
  description = "ARN tabla DynamoDB products"
  value       = module.dynamodb.products_table_arn
}

output "db_endpoint" {
  description = "Endpoint RDS PostgreSQL"
  value       = module.rds.endpoint
}

output "db_port" {
  description = "Puerto RDS PostgreSQL"
  value       = module.rds.port
}

output "db_name" {
  description = "Nombre de la base de datos RDS"
  value       = module.rds.db_name
}

output "redis_primary_endpoint" {
  description = "Endpoint primario Redis"
  value       = module.elasticache.primary_endpoint
}

output "redis_port" {
  description = "Puerto Redis"
  value       = module.elasticache.port
}
