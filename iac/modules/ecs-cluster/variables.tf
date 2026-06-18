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

variable "enable_container_insights" {
  description = "Habilita Container Insights en el cluster ECS"
  type        = bool
  default     = false
}
