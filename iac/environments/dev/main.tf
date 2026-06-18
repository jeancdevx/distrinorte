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

# -----------------------------------------------------------------------------
# Fase 2 — Datos
# -----------------------------------------------------------------------------

# module "s3" { ... }
# module "dynamodb" { ... }
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
