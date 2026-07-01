variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
}

variable "environment" {
  description = "Entorno de despliegue"
  type        = string
}

variable "tags" {
  description = "Tags comunes para todos los recursos"
  type        = map(string)
  default     = {}
}

variable "event_bus_arn" {
  description = "ARN del custom EventBridge bus"
  type        = string
}

variable "inventory_work_queue_arn" {
  description = "ARN cola SQS inventory-work"
  type        = string
}

variable "orders_events_queue_arn" {
  description = "ARN cola SQS orders-events"
  type        = string
}

variable "projections_work_queue_arn" {
  description = "ARN cola SQS projections-work"
  type        = string
}

variable "products_table_arn" {
  description = "ARN tabla DynamoDB products"
  type        = string
}

variable "catalog_availability_table_arn" {
  description = "ARN tabla DynamoDB catalog_availability"
  type        = string
}

variable "catalog_images_bucket_arn" {
  description = "ARN bucket S3 de imagenes de catalogo (seed-runner)"
  type        = string
  default     = null
  nullable    = true
}

variable "github_repository" {
  description = "Repositorio GitHub owner/repo para OIDC (ej. org/distrinorte)"
  type        = string
  default     = null
  nullable    = true
}

variable "enable_github_actions_oidc" {
  description = "Crear rol IAM OIDC para GitHub Actions"
  type        = bool
  default     = false
}

variable "github_oidc_branches" {
  description = "Branches permitidos para asumir el rol OIDC"
  type        = list(string)
  default     = ["develop", "production"]
}

variable "github_oidc_environments" {
  description = "GitHub Environments permitidos (claim sub ...:environment:NAME)"
  type        = list(string)
  default     = ["dev"]
}

variable "github_actions_attach_power_user" {
  description = "Adjuntar PowerUserAccess al rol OIDC (terraform apply en dev)"
  type        = bool
  default     = true
}

variable "ecr_repository_arns" {
  description = "ARNs de repositorios ECR para push desde CI"
  type        = list(string)
  default     = []
}

variable "terraform_state_bucket" {
  description = "Bucket S3 del backend Terraform (permisos state en rol CI)"
  type        = string
  default     = null
  nullable    = true
}

