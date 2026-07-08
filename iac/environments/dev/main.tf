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

module "ecr" {
  source = "../../modules/ecr"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
}

module "iam" {
  source = "../../modules/iam"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  event_bus_arn                  = module.messaging.event_bus_arn
  inventory_work_queue_arn       = module.messaging.inventory_work_queue_arn
  orders_events_queue_arn        = module.messaging.orders_events_queue_arn
  projections_work_queue_arn     = module.messaging.projections_work_queue_arn
  products_table_arn             = module.dynamodb.products_table_arn
  catalog_availability_table_arn = module.dynamodb.catalog_availability_table_arn
  catalog_images_bucket_arn      = module.s3.catalog_images_bucket_arn
  invoices_bucket_arn            = module.s3.invoices_bucket_arn
  invoices_table_arn             = module.dynamodb.invoices_table_arn
  billing_work_queue_arn         = module.messaging.billing_work_queue_arn
}

module "invoice_worker" {
  source = "../../modules/lambda"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  execution_role_arn         = module.iam.invoice_worker_role_arn
  billing_work_queue_arn     = module.messaging.billing_work_queue_arn
  event_bus_name             = module.messaging.event_bus_name
  invoices_bucket_name       = module.s3.invoices_bucket_name
  invoices_table_name        = module.dynamodb.invoices_table_name
  invoices_customer_gsi_name = module.dynamodb.invoices_customer_gsi_name
  source_zip_path            = local.invoice_worker_zip_path
}

module "github_oidc" {
  count  = var.enable_github_ci ? 1 : 0
  source = "../../modules/github-oidc"

  project_name         = local.project_name
  environment          = local.environment
  github_repository    = var.github_repository
  github_environment   = var.github_environment
  create_oidc_provider = var.github_create_oidc_provider
  tags                 = local.common_tags
}

module "github_terraform" {
  count  = var.enable_github_ci ? 1 : 0
  source = "../../modules/github-terraform"

  project_name               = local.project_name
  environment                = local.environment
  github_repository          = var.github_repository
  github_environment         = var.github_environment
  create_oidc_provider       = false
  state_bucket_name          = var.terraform_state_bucket
  state_key_prefix           = "env/${local.environment}/"
  grant_administrator_access = var.github_terraform_grant_admin
  tags                       = local.common_tags
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
  container_image = local.ecr_image["customers-service"]

  environment_variables = {
    PORT              = "3004"
    NODE_ENV          = var.environment
    AWS_REGION        = var.aws_region
    DATABASE_HOST     = module.rds.endpoint
    DATABASE_PORT     = tostring(module.rds.port)
    DATABASE_NAME     = module.rds.service_database_names.customers
    DATABASE_USER     = module.rds.username
    DATABASE_PASSWORD = var.db_password
    EVENT_BUS_NAME    = module.messaging.event_bus_name
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
  container_image = local.ecr_image["inventory-service"]

  environment_variables = {
    PORT                                   = "3002"
    NODE_ENV                               = var.environment
    AWS_REGION                             = var.aws_region
    DATABASE_HOST                          = module.rds.endpoint
    DATABASE_PORT                          = tostring(module.rds.port)
    DATABASE_NAME                          = module.rds.service_database_names.inventory
    DATABASE_USER                          = module.rds.username
    DATABASE_PASSWORD                      = var.db_password
    REDIS_HOST                             = module.elasticache.primary_endpoint
    REDIS_PORT                             = tostring(module.elasticache.port)
    REDIS_AUTH_TOKEN                       = var.redis_auth_token
    REDIS_TLS                              = tostring(var.redis_transit_encryption_enabled)
    EVENT_BUS_NAME                         = module.messaging.event_bus_name
    INVENTORY_WORK_QUEUE_URL               = module.messaging.inventory_work_queue_url
    STOCK_CACHE_RECONCILE_INTERVAL_SECONDS = "3600"
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
  container_image = local.ecr_image["orders-service"]

  environment_variables = {
    PORT                       = "3001"
    NODE_ENV                   = var.environment
    AWS_REGION                 = var.aws_region
    DATABASE_HOST              = module.rds.endpoint
    DATABASE_PORT              = tostring(module.rds.port)
    DATABASE_NAME              = module.rds.service_database_names.orders
    DATABASE_USER              = module.rds.username
    DATABASE_PASSWORD          = var.db_password
    EVENT_BUS_NAME             = module.messaging.event_bus_name
    ORDERS_EVENTS_QUEUE_URL    = module.messaging.orders_events_queue_url
    PROJECTIONS_WORK_QUEUE_URL = module.messaging.projections_work_queue_url
    INVOICES_BUCKET            = module.s3.invoices_bucket_name
  }

  sqs_queue_name           = module.messaging.orders_events_queue_name
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
  container_image = local.ecr_image["catalog-service"]

  environment_variables = {
    PORT                                = "3003"
    NODE_ENV                            = var.environment
    AWS_REGION                          = var.aws_region
    DYNAMODB_PRODUCTS_TABLE             = module.dynamodb.products_table_name
    DYNAMODB_CATEGORY_GSI               = module.dynamodb.products_category_gsi_name
    DYNAMODB_CATALOG_AVAILABILITY_TABLE = module.dynamodb.catalog_availability_table_name
    EVENT_BUS_NAME                      = module.messaging.event_bus_name
    PROJECTIONS_WORK_QUEUE_URL          = module.messaging.projections_work_queue_url
    REDIS_HOST                          = module.elasticache.primary_endpoint
    REDIS_PORT                          = tostring(module.elasticache.port)
    REDIS_AUTH_TOKEN                    = var.redis_auth_token
    REDIS_TLS                           = tostring(var.redis_transit_encryption_enabled)
    CATALOG_ASSETS_BASE_URL             = local.catalog_assets_base_url
  }

  sqs_queue_name = module.messaging.projections_work_queue_name

  autoscaling_max_capacity = 2
}

module "seed_runner_task" {
  source = "../../modules/ecs-task"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
  aws_region   = var.aws_region

  task_family     = "${local.name_prefix}-seed-runner"
  container_name  = "seed-runner"
  container_image = local.ecr_image["seed-runner"]

  task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  task_role_arn           = module.iam.seed_runner_task_role_arn

  cpu    = 512
  memory = 1024

  environment_variables = merge(local.seed_runner_environment_base, {
    CATALOG_ASSETS_BASE_URL = local.catalog_assets_base_url
  })
}


module "cognito" {
  source = "../../modules/cognito"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
  aws_region   = var.aws_region

  callback_urls = local.cognito_callback_urls_effective
  logout_urls   = local.cognito_logout_urls_effective
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

  origin_verify_secret   = var.origin_verify_secret
  api_gateway_stage_arn  = module.apigateway.stage_arn
  cloudfront_rate_limit  = var.waf_cloudfront_rate_limit
  api_gateway_rate_limit = var.waf_api_gateway_rate_limit

  enable_geo_restriction = var.waf_enable_geo_restriction
  allowed_country_codes  = var.waf_allowed_country_codes
  enable_bot_control     = var.waf_enable_bot_control
  block_anonymous_ips    = var.waf_block_anonymous_ips

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

module "route53_acm" {
  count  = local.create_acm_certificate ? 1 : 0
  source = "../../modules/route53"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  hosted_zone_id         = data.aws_route53_zone.main[0].zone_id
  create_acm_certificate = true
  domain_names           = local.cloudfront_domain_names

  providers = {
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

  portal_aliases      = local.cloudfront_portal_aliases_effective
  api_aliases         = local.cloudfront_api_aliases_effective
  assets_aliases      = local.cloudfront_assets_aliases_effective
  acm_certificate_arn = local.cloudfront_certificate_arn

  depends_on = [module.route53_acm]
}

module "route53_aliases" {
  count  = local.edge_dns_enabled ? 1 : 0
  source = "../../modules/route53"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags

  hosted_zone_id            = data.aws_route53_zone.main[0].zone_id
  create_cloudfront_aliases = true

  portal_record_name = var.route53_portal_record_name
  api_record_name    = var.route53_api_record_name
  assets_record_name = var.route53_assets_record_name

  portal_cloudfront_domain_name = module.cloudfront.portal_distribution_domain_name
  api_cloudfront_domain_name    = module.cloudfront.api_distribution_domain_name
  assets_cloudfront_domain_name = module.cloudfront.assets_distribution_domain_name

  providers = {
    aws.us_east_1 = aws.us_east_1
  }
}

# URLs públicas — CloudFront default (*.cloudfront.net) o custom domain (Route53)
locals {
  catalog_assets_base_url = local.edge_dns_enabled ? "https://${var.route53_assets_record_name}" : "https://${module.cloudfront.assets_distribution_domain_name}"
  api_public_base_url     = local.edge_dns_enabled ? "https://${var.route53_api_record_name}" : "https://${module.cloudfront.api_distribution_domain_name}"
  portal_public_base_url  = local.edge_dns_enabled ? "https://${var.route53_portal_record_name}" : "https://${module.cloudfront.portal_distribution_domain_name}"
}


module "observability" {
  source = "../../modules/observability"

  project_name = local.project_name
  environment  = local.environment
  tags         = local.common_tags
  aws_region   = var.aws_region

  api_gateway_name  = module.apigateway.api_gateway_name
  api_gateway_stage = module.apigateway.stage_name

  alb_arn_suffix            = module.alb.lb_arn_suffix
  target_group_arn_suffixes = module.alb.target_group_arn_suffixes
  ecs_cluster_name          = module.ecs_cluster.cluster_name
  ecs_service_names         = ["customers-service", "inventory-service", "orders-service", "catalog-service"]

  ecs_log_group_names = {
    customers-service = module.customers_service.log_group_name
    inventory-service = module.inventory_service.log_group_name
    orders-service    = module.orders_service.log_group_name
    catalog-service   = module.catalog_service.log_group_name
    seed-runner       = module.seed_runner_task.log_group_name
  }

  sqs_queue_names = {
    inventory-work   = module.messaging.inventory_work_queue_name
    orders-events    = module.messaging.orders_events_queue_name
    billing-work     = module.messaging.billing_work_queue_name
    projections-work = module.messaging.projections_work_queue_name
  }

  sqs_dlq_names = {
    inventory-work   = module.messaging.inventory_work_dlq_name
    orders-events    = module.messaging.orders_events_dlq_name
    billing-work     = module.messaging.billing_work_dlq_name
    projections-work = module.messaging.projections_work_dlq_name
  }

  alarm_email = var.observability_alarm_email
}
