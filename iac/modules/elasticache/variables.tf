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

variable "data_subnet_ids" {
  description = "Subnets privadas de datos para el subnet group"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security groups asociados al replication group"
  type        = list(string)
}

variable "engine_version" {
  description = "Version de Redis"
  type        = string
  default     = "7.1"
}

variable "node_type" {
  description = "Tipo de nodo ElastiCache"
  type        = string
  default     = "cache.t4g.micro"
}

variable "num_cache_clusters" {
  description = "Numero de nodos (1 = dev sin failover; 2+ habilita Multi-AZ)"
  type        = number
  default     = 1

  validation {
    condition     = var.num_cache_clusters >= 1 && var.num_cache_clusters <= 6
    error_message = "num_cache_clusters debe estar entre 1 y 6."
  }
}

variable "port" {
  description = "Puerto Redis"
  type        = number
  default     = 6379
}

variable "transit_encryption_enabled" {
  description = "Cifrado TLS en transito"
  type        = bool
  default     = true
}

variable "auth_token" {
  description = "Token AUTH de Redis (requerido si transit_encryption_enabled)"
  type        = string
  sensitive   = true
  default     = null
  nullable    = true

  validation {
    condition = (
      !var.transit_encryption_enabled
      || (var.auth_token != null && length(var.auth_token) >= 16)
    )
    error_message = "auth_token es requerido (minimo 16 caracteres) cuando transit_encryption_enabled es true."
  }
}

variable "snapshot_retention_limit" {
  description = "Dias de retencion de snapshots automaticos"
  type        = number
  default     = 7
}

variable "snapshot_window" {
  description = "Ventana UTC de snapshots"
  type        = string
  default     = "03:00-04:00"
}

variable "apply_immediately" {
  description = "Aplicar cambios de mantenimiento de inmediato"
  type        = bool
  default     = true
}
