variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
}

variable "environment" {
  description = "Entorno de despliegue"
  type        = string
}

variable "aws_region" {
  description = "Region AWS para metricas y dashboard"
  type        = string
}

variable "tags" {
  description = "Tags comunes"
  type        = map(string)
  default     = {}
}

variable "api_gateway_name" {
  description = "Nombre del REST API (dimension ApiName)"
  type        = string
}

variable "api_gateway_stage" {
  description = "Stage del REST API (dimension Stage)"
  type        = string
}

variable "alb_arn_suffix" {
  description = "Sufijo ARN del ALB (dimension LoadBalancer)"
  type        = string
}

variable "target_group_arn_suffixes" {
  description = "Mapa servicio -> sufijo ARN del target group"
  type        = map(string)
}

variable "ecs_cluster_name" {
  description = "Nombre del cluster ECS"
  type        = string
}

variable "ecs_service_names" {
  description = "Nombres de servicios ECS (customers-service, etc.)"
  type        = list(string)
}

variable "ecs_log_group_names" {
  description = "Mapa servicio -> log group CloudWatch de ECS"
  type        = map(string)
}

variable "sqs_queue_names" {
  description = "Colas SQS operativas a monitorear (profundidad)"
  type        = map(string)
  default     = {}
}

variable "sqs_dlq_names" {
  description = "Mapa alias -> nombre de cola DLQ"
  type        = map(string)
}

variable "alarm_email" {
  description = "Email opcional para suscripcion SNS de alarmas"
  type        = string
  default     = null
  nullable    = true
}

variable "api_5xx_threshold" {
  description = "Umbral de errores 5xx API Gateway en 5 min (suma)"
  type        = number
  default     = 5
}

variable "alb_target_5xx_threshold" {
  description = "Umbral de 5xx de targets ALB en 5 min (suma)"
  type        = number
  default     = 5
}

variable "sqs_dlq_message_threshold" {
  description = "Umbral de mensajes visibles en DLQ"
  type        = number
  default     = 0
}

variable "ecs_error_log_threshold" {
  description = "Umbral de lineas ERROR en logs ECS por periodo"
  type        = number
  default     = 10
}
