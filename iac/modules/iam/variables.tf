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

variable "products_table_arn" {
  description = "ARN tabla DynamoDB products"
  type        = string
}
