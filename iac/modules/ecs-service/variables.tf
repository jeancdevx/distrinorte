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

variable "aws_region" {
  description = "Region AWS para logs"
  type        = string
}

variable "service_name" {
  description = "Nombre corto del servicio (ej. customers-service)"
  type        = string
}

variable "cluster_arn" {
  description = "ARN del cluster ECS"
  type        = string
}

variable "cluster_name" {
  description = "Nombre del cluster ECS (requerido para auto scaling)"
  type        = string
}

variable "subnet_ids" {
  description = "Subnets privadas para las tasks"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security groups de las tasks"
  type        = list(string)
}

variable "target_group_arn" {
  description = "ARN del target group del ALB"
  type        = string
}

variable "task_execution_role_arn" {
  description = "ARN del ECS task execution role"
  type        = string
}

variable "task_role_arn" {
  description = "ARN del ECS task role del servicio"
  type        = string
}

variable "container_port" {
  description = "Puerto HTTP del contenedor"
  type        = number
}

variable "container_image" {
  description = "Imagen Docker del contenedor"
  type        = string
}

variable "container_command" {
  description = "Comando opcional del contenedor (placeholder nginx, etc.)"
  type        = list(string)
  default     = []
}

variable "environment_variables" {
  description = "Variables de entorno del contenedor"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "cpu" {
  description = "CPU units Fargate (256, 512, ...)"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memoria Fargate en MiB"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Numero inicial de tasks"
  type        = number
  default     = 1
}

variable "log_retention_in_days" {
  description = "Retencion de logs CloudWatch"
  type        = number
  default     = 14
}

variable "enable_execute_command" {
  description = "Habilita ECS Exec para debugging"
  type        = bool
  default     = false
}

variable "enable_autoscaling" {
  description = "Habilita auto scaling por CPU (y SQS si aplica)"
  type        = bool
  default     = true
}

variable "autoscaling_min_capacity" {
  description = "Minimo de tasks con auto scaling"
  type        = number
  default     = 1
}

variable "autoscaling_max_capacity" {
  description = "Maximo de tasks con auto scaling"
  type        = number
  default     = 4
}

variable "autoscaling_cpu_target" {
  description = "Target de CPU para target tracking scaling"
  type        = number
  default     = 70
}

variable "sqs_queue_name" {
  description = "Nombre de cola SQS para target tracking scaling (inventory-service, orders-service)"
  type        = string
  default     = null
  nullable    = true
}

variable "sqs_scaling_target_value" {
  description = "Mensajes visibles objetivo por task (SQS scaling)"
  type        = number
  default     = 10
}
