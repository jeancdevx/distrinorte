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
  description = "Security groups asociados a la instancia RDS"
  type        = list(string)
}

variable "db_name" {
  description = "Nombre de la base de datos inicial"
  type        = string
  default     = "distrinorte"
}

variable "db_username" {
  description = "Usuario maestro de PostgreSQL"
  type        = string
  default     = "distrinorte_admin"
}

variable "db_password" {
  description = "Contrasena maestra de PostgreSQL (no commitear)"
  type        = string
  sensitive   = true
}

variable "engine_version" {
  description = "Version de PostgreSQL"
  type        = string
  default     = "17.7"
}

variable "instance_class" {
  description = "Clase de instancia RDS"
  type        = string
  default     = "db.t4g.medium"
}

variable "allocated_storage" {
  description = "Almacenamiento inicial en GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Autoscaling de almacenamiento hasta este maximo (0 = deshabilitado)"
  type        = number
  default     = 100
}

variable "multi_az" {
  description = "Despliegue Multi-AZ"
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "Dias de retencion de backups automaticos"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Proteccion contra borrado accidental"
  type        = bool
  default     = false
}

variable "skip_final_snapshot" {
  description = "Omitir snapshot final al destruir (solo dev)"
  type        = bool
  default     = true
}

variable "performance_insights_enabled" {
  description = "Habilitar Performance Insights"
  type        = bool
  default     = false
}
