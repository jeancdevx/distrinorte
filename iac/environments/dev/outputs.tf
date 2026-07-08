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

output "catalog_service_name" {
  description = "Nombre del ECS service catalog-service"
  value       = module.catalog_service.service_name
}

output "cognito_user_pool_id" {
  description = "ID del Cognito User Pool"
  value       = module.cognito.user_pool_id
}

output "cognito_app_client_id" {
  description = "Client ID del SPA Cognito"
  value       = module.cognito.app_client_id
}

output "cognito_hosted_ui_base_url" {
  description = "URL base OAuth / hosted UI Cognito"
  value       = module.cognito.hosted_ui_base_url
}

output "cognito_issuer_url" {
  description = "Issuer URL para JWT"
  value       = module.cognito.issuer_url
}

output "api_gateway_invoke_url" {
  description = "URL base del API Gateway stage"
  value       = module.apigateway.stage_invoke_url
}

output "api_gateway_rest_api_id" {
  description = "ID del REST API"
  value       = module.apigateway.rest_api_id
}

output "cloudfront_portal_domain_name" {
  description = "Dominio CloudFront del portal SPA"
  value       = module.cloudfront.portal_distribution_domain_name
}

output "cloudfront_api_domain_name" {
  description = "Dominio CloudFront del proxy API"
  value       = module.cloudfront.api_distribution_domain_name
}

output "cloudfront_assets_domain_name" {
  description = "Dominio CloudFront de imagenes de catalogo"
  value       = module.cloudfront.assets_distribution_domain_name
}

output "api_public_base_url" {
  description = "URL publica HTTPS de la API (custom domain o CloudFront default)"
  value       = local.api_public_base_url
}

output "portal_public_base_url" {
  description = "URL publica HTTPS del portal (custom domain o CloudFront default)"
  value       = local.portal_public_base_url
}

output "catalog_assets_base_url" {
  description = "URL base HTTPS de assets de catalogo (custom domain o CloudFront default)"
  value       = local.catalog_assets_base_url
}

output "custom_domain_enabled" {
  description = "Si Route53 + dominio propio estan activos"
  value       = local.edge_dns_enabled
}

output "api_gateway_web_acl_id" {
  description = "WAF regional del API Gateway"
  value       = module.waf.api_gateway_web_acl_id
}

output "cloudfront_web_acl_id" {
  description = "WAF global asociado a las distribuciones CloudFront"
  value       = module.waf.cloudfront_web_acl_id
}

output "route53_portal_fqdn" {
  description = "FQDN del portal en Route53"
  value       = try(module.route53_aliases[0].portal_fqdn, null)
}

output "route53_api_fqdn" {
  description = "FQDN de la API en Route53"
  value       = try(module.route53_aliases[0].api_fqdn, null)
}

output "route53_assets_fqdn" {
  description = "FQDN de assets en Route53"
  value       = try(module.route53_aliases[0].assets_fqdn, null)
}

output "acm_certificate_arn" {
  description = "ARN del certificado ACM CloudFront (us-east-1)"
  value       = local.cloudfront_certificate_arn
}

output "ecr_repository_urls" {
  description = "URLs de repositorios ECR"
  value       = module.ecr.repository_urls
}

output "seed_runner_task_definition_arn" {
  description = "ARN de la task definition seed-runner"
  value       = module.seed_runner_task.task_definition_arn
}

output "github_deploy_role_arn" {
  description = "Rol OIDC para deploy (ECR/ECS) — secret AWS_DEPLOY_ROLE_ARN"
  value       = try(module.github_oidc[0].deploy_role_arn, null)
}

output "github_terraform_apply_role_arn" {
  description = "Rol OIDC para terraform apply — secret AWS_TERRAFORM_APPLY_ROLE_ARN"
  value       = try(module.github_terraform[0].terraform_apply_role_arn, null)
}

output "observability_dashboard_name" {
  description = "Dashboard CloudWatch de operaciones"
  value       = module.observability.dashboard_name
}

output "observability_sns_topic_arn" {
  description = "Topic SNS para alarmas operativas"
  value       = module.observability.sns_topic_arn
}
