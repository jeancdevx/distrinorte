# Instanciación de módulos — descomentar en orden del roadmap (docs/03-roadmap-implementacion.md)

# -----------------------------------------------------------------------------
# Fase 1 — Fundación
# -----------------------------------------------------------------------------

# module "networking" {
#   source = "../../modules/networking"
#
#   project_name = local.project_name
#   environment  = local.environment
#   tags         = local.common_tags
#   vpc_cidr     = var.vpc_cidr
#   azs          = slice(data.aws_availability_zones.available.names, 0, 3)
# }

# module "security_groups" {
#   source = "../../modules/security-groups"
#
#   project_name = local.project_name
#   environment  = local.environment
#   tags         = local.common_tags
#   vpc_id       = module.networking.vpc_id
# }

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
