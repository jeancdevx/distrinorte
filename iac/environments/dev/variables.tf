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
