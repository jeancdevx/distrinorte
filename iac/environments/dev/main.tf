module "networking" {
  source = "../../modules/networking"

  project_name         = local.project_name
  environment          = local.environment
  tags                 = local.common_tags
  vpc_cidr             = var.vpc_cidr
  azs                  = var.azs
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  data_subnet_cidrs    = var.data_subnet_cidrs
  enable_nat_gateway   = var.enable_nat_gateway
  single_nat_gateway   = var.single_nat_gateway
  enable_vpc_endpoints = var.enable_vpc_endpoints
}

module "security_groups" {
  source = "../../modules/security-groups"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
  vpc_id       = module.networking.vpc_id
  vpc_cidr     = module.networking.vpc_cidr
}

module "s3" {
  source = "../../modules/s3"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  force_destroy           = var.s3_force_destroy
  enable_versioning       = var.s3_enable_versioning
  backups_noncurrent_days = var.s3_backups_noncurrent_days
}

module "dynamodb" {
  source = "../../modules/dynamodb"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  billing_mode                  = var.dynamodb_billing_mode
  enable_point_in_time_recovery = var.dynamodb_enable_pitr
  deletion_protection           = var.dynamodb_deletion_protection
}

module "rds" {
  source = "../../modules/rds"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  data_subnet_ids    = module.networking.data_subnet_ids
  security_group_ids = [module.security_groups.rds_sg_id]

  db_password = var.db_password

  engine_version               = var.db_engine_version
  instance_class               = var.db_instance_class
  allocated_storage            = var.db_allocated_storage
  max_allocated_storage        = var.db_max_allocated_storage
  multi_az                     = var.db_multi_az
  backup_retention_period      = var.db_backup_retention_period
  deletion_protection          = var.db_deletion_protection
  skip_final_snapshot          = var.db_skip_final_snapshot
  performance_insights_enabled = var.db_performance_insights_enabled
}

module "elasticache" {
  source = "../../modules/elasticache"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  data_subnet_ids    = module.networking.data_subnet_ids
  security_group_ids = [module.security_groups.redis_sg_id]

  engine_version             = var.redis_engine_version
  node_type                  = var.redis_node_type
  num_cache_clusters         = var.redis_num_cache_clusters
  transit_encryption_enabled = var.redis_transit_encryption_enabled
  auth_token                 = var.redis_auth_token
  snapshot_retention_limit   = var.redis_snapshot_retention_limit
}

module "messaging" {
  source = "../../modules/messaging"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
}

module "iam" {
  source = "../../modules/iam"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  event_bus_arn            = module.messaging.event_bus_arn
  inventory_work_queue_arn = module.messaging.inventory_work_queue_arn
  orders_events_queue_arn  = module.messaging.orders_events_queue_arn
  products_table_arn       = module.dynamodb.products_table_arn
}

module "ecs_cluster" {
  source = "../../modules/ecs-cluster"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
}

module "alb" {
  source = "../../modules/alb"

  project_name       = local.project_name
  environment        = local.environment
  tags               = local.common_tags
  vpc_id             = module.networking.vpc_id
  subnet_ids         = module.networking.private_subnet_ids
  security_group_ids = [module.security_groups.alb_sg_id]
}

module "customers_service" {
  source = "../../modules/ecs-service"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
  aws_region   = var.aws_region

  service_name = "customers-service"
  cluster_arn  = module.ecs_cluster.cluster_arn
  cluster_name = module.ecs_cluster.cluster_name

  subnet_ids         = module.networking.private_subnet_ids
  security_group_ids = [module.security_groups.ecs_sg_id]
  target_group_arn   = module.alb.customers_target_group_arn

  task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  task_role_arn           = module.iam.customers_task_role_arn

  container_port  = 3004
  container_image = "public.ecr.aws/nginx/nginx:stable-alpine"
  container_command = [
    "sh",
    "-c",
    "printf '%s\\n' 'server { listen 3004; location /health { add_header Content-Type text/plain; return 200 \"ok\"; } location / { add_header Content-Type text/plain; return 200 \"placeholder\"; } }' > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'",
  ]

  environment_variables = {
    PORT              = "3004"
    NODE_ENV          = var.environment
    DATABASE_HOST     = module.rds.endpoint
    DATABASE_PORT     = tostring(module.rds.port)
    DATABASE_NAME     = module.rds.db_name
    DATABASE_USER     = module.rds.username
    DATABASE_PASSWORD = var.db_password
  }

  autoscaling_max_capacity = 2
}

module "inventory_service" {
  source = "../../modules/ecs-service"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
  aws_region   = var.aws_region

  service_name = "inventory-service"
  cluster_arn  = module.ecs_cluster.cluster_arn
  cluster_name = module.ecs_cluster.cluster_name

  subnet_ids         = module.networking.private_subnet_ids
  security_group_ids = [module.security_groups.ecs_sg_id]
  target_group_arn   = module.alb.inventory_target_group_arn

  task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  task_role_arn           = module.iam.inventory_task_role_arn

  container_port  = 3002
  container_image = "public.ecr.aws/nginx/nginx:stable-alpine"
  container_command = [
    "sh",
    "-c",
    "printf '%s\\n' 'server { listen 3002; location /health { add_header Content-Type text/plain; return 200 \"ok\"; } location / { add_header Content-Type text/plain; return 200 \"placeholder\"; } }' > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'",
  ]

  environment_variables = {
    PORT                     = "3002"
    NODE_ENV                 = var.environment
    DATABASE_HOST            = module.rds.endpoint
    DATABASE_PORT            = tostring(module.rds.port)
    DATABASE_NAME            = module.rds.db_name
    DATABASE_USER            = module.rds.username
    DATABASE_PASSWORD        = var.db_password
    REDIS_HOST               = module.elasticache.primary_endpoint
    REDIS_PORT               = tostring(module.elasticache.port)
    REDIS_AUTH_TOKEN         = var.redis_auth_token
    REDIS_TLS                = tostring(var.redis_transit_encryption_enabled)
    EVENT_BUS_NAME           = module.messaging.event_bus_name
    INVENTORY_WORK_QUEUE_URL = module.messaging.inventory_work_queue_url
  }

  sqs_queue_name           = module.messaging.inventory_work_queue_name
  autoscaling_max_capacity = 4
}

module "orders_service" {
  source = "../../modules/ecs-service"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
  aws_region   = var.aws_region

  service_name = "orders-service"
  cluster_arn  = module.ecs_cluster.cluster_arn
  cluster_name = module.ecs_cluster.cluster_name

  subnet_ids         = module.networking.private_subnet_ids
  security_group_ids = [module.security_groups.ecs_sg_id]
  target_group_arn   = module.alb.orders_target_group_arn

  task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  task_role_arn           = module.iam.orders_task_role_arn

  container_port  = 3001
  container_image = "public.ecr.aws/nginx/nginx:stable-alpine"
  container_command = [
    "sh",
    "-c",
    "printf '%s\\n' 'server { listen 3001; location /health { add_header Content-Type text/plain; return 200 \"ok\"; } location / { add_header Content-Type text/plain; return 200 \"placeholder\"; } }' > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'",
  ]

  environment_variables = {
    PORT                    = "3001"
    NODE_ENV                = var.environment
    DATABASE_HOST           = module.rds.endpoint
    DATABASE_PORT           = tostring(module.rds.port)
    DATABASE_NAME           = module.rds.db_name
    DATABASE_USER           = module.rds.username
    DATABASE_PASSWORD       = var.db_password
    EVENT_BUS_NAME          = module.messaging.event_bus_name
    ORDERS_EVENTS_QUEUE_URL = module.messaging.orders_events_queue_url
  }

  autoscaling_max_capacity = 2
}

module "catalog_service" {
  source = "../../modules/ecs-service"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
  aws_region   = var.aws_region

  service_name = "catalog-service"
  cluster_arn  = module.ecs_cluster.cluster_arn
  cluster_name = module.ecs_cluster.cluster_name

  subnet_ids         = module.networking.private_subnet_ids
  security_group_ids = [module.security_groups.ecs_sg_id]
  target_group_arn   = module.alb.catalog_target_group_arn

  task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  task_role_arn           = module.iam.catalog_task_role_arn

  container_port  = 3003
  container_image = "public.ecr.aws/nginx/nginx:stable-alpine"
  container_command = [
    "sh",
    "-c",
    "printf '%s\\n' 'server { listen 3003; location /health { add_header Content-Type text/plain; return 200 \"ok\"; } location / { add_header Content-Type text/plain; return 200 \"placeholder\"; } }' > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'",
  ]

  environment_variables = {
    PORT                    = "3003"
    NODE_ENV                = var.environment
    AWS_REGION              = var.aws_region
    DYNAMODB_PRODUCTS_TABLE = module.dynamodb.products_table_name
    DYNAMODB_CATEGORY_GSI   = module.dynamodb.products_category_gsi_name
    REDIS_HOST              = module.elasticache.primary_endpoint
    REDIS_PORT              = tostring(module.elasticache.port)
    REDIS_AUTH_TOKEN        = var.redis_auth_token
    REDIS_TLS               = tostring(var.redis_transit_encryption_enabled)
    CATALOG_IMAGES_BUCKET   = module.s3.catalog_images_bucket_name
  }

  autoscaling_max_capacity = 2
}


module "cognito" {
  source = "../../modules/cognito"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
  aws_region   = var.aws_region

  callback_urls = var.cognito_callback_urls
  logout_urls   = var.cognito_logout_urls
}

module "apigateway" {
  source = "../../modules/apigateway"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  subnet_ids                  = module.networking.private_subnet_ids
  vpc_link_security_group_ids = [module.security_groups.vpc_link_sg_id]
  alb_arn                     = module.alb.alb_arn
  alb_dns_name                = module.alb.alb_dns_name
  cognito_user_pool_arn       = module.cognito.user_pool_arn
  stage_name                  = local.environment
}

module "waf" {
  source = "../../modules/waf"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  origin_verify_secret  = var.origin_verify_secret
  api_gateway_stage_arn = module.apigateway.stage_arn
  cloudfront_rate_limit = var.waf_cloudfront_rate_limit

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
  aws_region   = var.aws_region

  portal_spa_bucket_name     = module.s3.portal_spa_bucket_name
  portal_spa_bucket_arn      = module.s3.portal_spa_bucket_arn
  catalog_images_bucket_name = module.s3.catalog_images_bucket_name
  catalog_images_bucket_arn  = module.s3.catalog_images_bucket_arn

  api_gateway_rest_api_id = module.apigateway.rest_api_id
  api_gateway_stage_name  = module.apigateway.stage_name
  origin_verify_secret    = var.origin_verify_secret
  web_acl_id              = module.waf.cloudfront_web_acl_arn

  portal_aliases = var.cloudfront_portal_aliases
  api_aliases    = var.cloudfront_api_aliases
  assets_aliases = var.cloudfront_assets_aliases
  # acm_certificate_arn = var.cloudfront_acm_certificate_arn
}

# -----------------------------------------------------------------------------
# Fase 6 — Observabilidad
# -----------------------------------------------------------------------------

# module "observability" { ... }
