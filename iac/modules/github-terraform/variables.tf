variable "create_oidc_provider" {
  description = "Crear el proveedor OIDC de GitHub (uno por cuenta AWS)"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Nombre del entorno (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment debe ser dev, staging o prod."
  }
}

variable "github_environment" {
  description = "GitHub environment autorizado a asumir el rol de terraform apply"
  type        = string
  default     = ""
}

variable "github_repository" {
  description = "Repositorio GitHub en formato owner/name"
  type        = string

  validation {
    condition     = can(regex("^[^/]+/[^/]+$", var.github_repository))
    error_message = "github_repository debe tener formato owner/name."
  }
}

variable "grant_administrator_access" {
  description = "Adjuntar AdministratorAccess al rol apply (solo dev; false en prod)"
  type        = bool
  default     = true
}

variable "project_name" {
  description = "Nombre del proyecto para naming"
  type        = string
  default     = "distrinorte"
}

variable "state_bucket_name" {
  description = "Bucket S3 del state remoto de Terraform"
  type        = string
}

variable "state_key_prefix" {
  description = "Prefijo opcional de keys en el bucket (ej. env/dev/)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags adicionales en recursos IAM"
  type        = map(string)
  default     = {}
}
