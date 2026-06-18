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

# module "rds" { ... }
# module "elasticache" { ... }

# -----------------------------------------------------------------------------
# Fase 3 — Mensajería
# -----------------------------------------------------------------------------

# module "messaging" { ... }

# -----------------------------------------------------------------------------
# Fase 4 — Compute
# -----------------------------------------------------------------------------

# module "iam" { ... }
# module "ecs_cluster" { ... }
# module "alb" { ... }
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
