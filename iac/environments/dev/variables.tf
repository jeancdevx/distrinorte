variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "distrinorte"
}

variable "environment" {
  description = "Entorno de despliegue"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "Región AWS"
  type        = string
  default     = "us-east-2"
}

variable "aws_profile" {
  description = "Perfil AWS CLI (SSO)"
  type        = string
  default     = null
  nullable    = true
}

variable "tags" {
  description = "Tags adicionales"
  type        = map(string)
  default     = {}
}

variable "vpc_cidr" {
  description = "CIDR block de la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-2a", "us-east-2b", "us-east-2c"]
}

variable "public_subnet_cidrs" {
  description = "CIDRs subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs subnets privadas (compute)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
}

variable "data_subnet_cidrs" {
  description = "CIDRs subnets de datos (RDS, Redis)"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24", "10.0.22.0/24"]
}

variable "enable_nat_gateway" {
  type    = bool
  default = true
}

variable "single_nat_gateway" {
  type    = bool
  default = true
}

variable "enable_vpc_endpoints" {
  type    = bool
  default = true
}

variable "s3_force_destroy" {
  description = "Permitir vaciar buckets S3 al destruir el entorno"
  type        = bool
  default     = false
}

variable "s3_enable_versioning" {
  description = "Versionado en buckets S3 de aplicacion"
  type        = bool
  default     = true
}

variable "s3_backups_noncurrent_days" {
  description = "Dias de retencion de versiones no actuales en bucket backups"
  type        = number
  default     = 90
}

variable "dynamodb_billing_mode" {
  description = "Modo de facturacion DynamoDB (PAY_PER_REQUEST o PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "dynamodb_enable_pitr" {
  description = "Point-in-time recovery en tabla products"
  type        = bool
  default     = false
}

variable "dynamodb_deletion_protection" {
  description = "Proteccion contra borrado de tabla DynamoDB"
  type        = bool
  default     = false
}

variable "db_password" {
  description = "Contrasena maestra PostgreSQL (no commitear)"
  type        = string
  sensitive   = true
}

variable "db_engine_version" {
  description = "Version de PostgreSQL"
  type        = string
  default     = "17.7"
}

variable "db_instance_class" {
  description = "Clase de instancia RDS"
  type        = string
  default     = "db.t4g.medium"
}

variable "db_allocated_storage" {
  description = "Almacenamiento inicial RDS en GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximo autoscaling de almacenamiento RDS (0 = off)"
  type        = number
  default     = 100
}

variable "db_multi_az" {
  description = "RDS Multi-AZ"
  type        = bool
  default     = false
}

variable "db_backup_retention_period" {
  description = "Dias de retencion de backups RDS"
  type        = number
  default     = 7
}

variable "db_deletion_protection" {
  description = "Proteccion contra borrado de RDS"
  type        = bool
  default     = false
}

variable "db_skip_final_snapshot" {
  description = "Omitir snapshot final al destruir RDS"
  type        = bool
  default     = true
}

variable "db_performance_insights_enabled" {
  description = "Performance Insights en RDS"
  type        = bool
  default     = false
}

variable "redis_engine_version" {
  description = "Version de Redis"
  type        = string
  default     = "7.1"
}

variable "redis_node_type" {
  description = "Tipo de nodo ElastiCache"
  type        = string
  default     = "cache.t4g.micro"
}

variable "redis_num_cache_clusters" {
  description = "Nodos Redis (1 dev; 2+ con failover)"
  type        = number
  default     = 1
}

variable "redis_transit_encryption_enabled" {
  description = "TLS en transito para Redis"
  type        = bool
  default     = true
}

variable "redis_auth_token" {
  description = "Token AUTH Redis (requerido con TLS; no commitear)"
  type        = string
  sensitive   = true
  default     = null
  nullable    = true
}

variable "redis_snapshot_retention_limit" {
  description = "Dias de retencion de snapshots Redis"
  type        = number
  default     = 7
}

variable "cognito_callback_urls" {
  description = "OAuth callback URLs del portal B2B"
  type        = list(string)
  default     = ["http://localhost:5173/callback"]
}

variable "cognito_logout_urls" {
  description = "OAuth logout URLs del portal B2B"
  type        = list(string)
  default     = ["http://localhost:5173/"]
}

variable "cloudfront_portal_aliases" {
  description = "Aliases CloudFront del portal (requiere ACM us-east-1)"
  type        = list(string)
  default     = []
}

variable "cloudfront_api_aliases" {
  description = "Aliases CloudFront de la API (requiere ACM us-east-1)"
  type        = list(string)
  default     = []
}

variable "cloudfront_assets_aliases" {
  description = "Aliases CloudFront de assets (requiere ACM us-east-1)"
  type        = list(string)
  default     = []
}

variable "cloudfront_acm_certificate_arn" {
  description = "ACM certificate ARN in us-east-1 for CloudFront custom domains"
  type        = string
  default     = null
  nullable    = true
}

variable "origin_verify_secret" {
  description = "Secreto CloudFront -> API Gateway (header X-Origin-Verify; no commitear)"
  type        = string
  sensitive   = true
}

variable "waf_cloudfront_rate_limit" {
  description = "Rate limit WAF CloudFront (requests por IP cada 5 min)"
  type        = number
  default     = 2000
}

variable "waf_api_gateway_rate_limit" {
  description = "Rate limit WAF API Gateway (requests por IP cada 5 min)"
  type        = number
  default     = 1000
}

variable "waf_enable_geo_restriction" {
  description = "WAF geo-blocking: solo allowed_country_codes"
  type        = bool
  default     = false
}

variable "waf_allowed_country_codes" {
  description = "Paises permitidos por WAF (ISO 3166-1 alpha-2)"
  type        = list(string)
  default     = ["PE"]
}

variable "waf_enable_bot_control" {
  description = "AWS Bot Control en WAF (reglas de pago)"
  type        = bool
  default     = false
}

variable "route53_domain_name" {
  description = "Dominio Route53 existente (ej. galaxymorph.com). Null omite DNS edge."
  type        = string
  default     = null
  nullable    = true
}

variable "route53_portal_record_name" {
  description = "FQDN del portal SPA"
  type        = string
  default     = "pedidos.galaxymorph.com"
}

variable "route53_api_record_name" {
  description = "FQDN del proxy API"
  type        = string
  default     = "api.pedidos.galaxymorph.com"
}

variable "route53_assets_record_name" {
  description = "FQDN del CDN de assets"
  type        = string
  default     = "assets.galaxymorph.com"
}

variable "container_image_tag" {
  description = "Tag de imagenes ECR para servicios ECS (ej. git SHA o latest)"
  type        = string
  default     = "latest"
}

variable "enable_github_actions_oidc" {
  description = "Crear proveedor OIDC + rol IAM para GitHub Actions"
  type        = bool
  default     = false
}

variable "github_repository" {
  description = "Repositorio GitHub owner/repo para OIDC (requerido si OIDC habilitado)"
  type        = string
  default     = null
  nullable    = true
}

variable "github_oidc_branches" {
  description = "Branches que pueden asumir el rol OIDC"
  type        = list(string)
  default     = ["develop", "production"]
}

variable "github_oidc_environments" {
  description = "GitHub Environments permitidos para OIDC (ej. dev)"
  type        = list(string)
  default     = ["dev"]
}

variable "github_actions_attach_power_user" {
  description = "Adjuntar PowerUserAccess al rol OIDC (terraform apply desde CI)"
  type        = bool
  default     = true
}

variable "terraform_state_bucket" {
  description = "Bucket S3 del backend Terraform (permisos state en rol GitHub Actions)"
  type        = string
  default     = null
  nullable    = true
}
