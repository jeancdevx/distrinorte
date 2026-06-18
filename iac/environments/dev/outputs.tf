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

output "event_bus_arn" {
  description = "ARN del EventBridge bus"
  value       = module.messaging.event_bus_arn
}

output "inventory_work_queue_url" {
  description = "URL cola inventory-work"
  value       = module.messaging.inventory_work_queue_url
}

output "orders_events_queue_url" {
  description = "URL cola orders-events"
  value       = module.messaging.orders_events_queue_url
}

output "ecs_task_execution_role_arn" {
  description = "ECS task execution role"
  value       = module.iam.ecs_task_execution_role_arn
}

output "orders_task_role_arn" {
  description = "Task role orders-service"
  value       = module.iam.orders_task_role_arn
}

output "inventory_task_role_arn" {
  description = "Task role inventory-service"
  value       = module.iam.inventory_task_role_arn
}

output "ecs_cluster_name" {
  description = "Nombre del cluster ECS"
  value       = module.ecs_cluster.cluster_name
}

output "ecs_cluster_arn" {
  description = "ARN del cluster ECS"
  value       = module.ecs_cluster.cluster_arn
}

output "alb_arn" {
  description = "ARN del ALB interno"
  value       = module.alb.alb_arn
}

output "alb_dns_name" {
  description = "DNS name del ALB interno"
  value       = module.alb.alb_dns_name
}

output "orders_target_group_arn" {
  description = "Target group ARN de orders-service"
  value       = module.alb.orders_target_group_arn
}

output "inventory_target_group_arn" {
  description = "Target group ARN de inventory-service"
  value       = module.alb.inventory_target_group_arn
}

output "catalog_target_group_arn" {
  description = "Target group ARN de catalog-service"
  value       = module.alb.catalog_target_group_arn
}

output "customers_target_group_arn" {
  description = "Target group ARN de customers-service"
  value       = module.alb.customers_target_group_arn
}

output "customers_service_name" {
  description = "Nombre del ECS service customers-service"
  value       = module.customers_service.service_name
}

output "inventory_service_name" {
  description = "Nombre del ECS service inventory-service"
  value       = module.inventory_service.service_name
}

output "orders_service_name" {
  description = "Nombre del ECS service orders-service"
  value       = module.orders_service.service_name
}
