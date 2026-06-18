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

# module "orders_service" { source = "../../modules/ecs-service" ... }

# -----------------------------------------------------------------------------
# Fase 5 — Edge
# -----------------------------------------------------------------------------

# module "cognito" { ... }
# module "apigateway" { ... }
# module "cloudfront" { ... }

# -----------------------------------------------------------------------------
# Fase 6 — Observabilidad
# -----------------------------------------------------------------------------

# module "observability" { ... }
