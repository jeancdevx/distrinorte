variable "create_oidc_provider" {
  description = "Crear el proveedor OIDC de GitHub (uno por cuenta AWS)"
  type        = bool
  default     = true
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
  description = "GitHub environment autorizado a asumir el rol de deploy (por defecto var.environment)"
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

variable "project_name" {
  description = "Nombre del proyecto para naming y tags"
  type        = string
  default     = "distrinorte"
}

variable "tags" {
  description = "Tags adicionales en recursos IAM"
  type        = map(string)
  default     = {}
}
