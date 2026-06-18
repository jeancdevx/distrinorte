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

variable "vpc_id" {
  description = "ID de la VPC"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block de la VPC"
  type        = string
}

variable "ecs_container_port_from" {
  description = "Puerto mínimo de contenedores ECS (inclusive)"
  type        = number
  default     = 3000
}

variable "ecs_container_port_to" {
  description = "Puerto máximo de contenedores ECS (inclusive)"
  type        = number
  default     = 3010
}

variable "postgres_port" {
  description = "Puerto PostgreSQL"
  type        = number
  default     = 5432
}

variable "redis_port" {
  description = "Puerto Redis"
  type        = number
  default     = 6379
}
