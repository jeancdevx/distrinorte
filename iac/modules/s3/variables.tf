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

variable "enable_versioning" {
  description = "Habilitar versionado en buckets de aplicacion"
  type        = bool
  default     = true
}

variable "force_destroy" {
  description = "Permitir vaciar buckets al destruir (solo dev)"
  type        = bool
  default     = false
}

variable "backups_noncurrent_days" {
  description = "Dias antes de expirar versiones no actuales en bucket backups"
  type        = number
  default     = 90
}
