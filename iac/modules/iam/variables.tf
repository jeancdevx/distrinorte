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

variable "projections_work_queue_arn" {
  description = "ARN cola SQS projections-work"
  type        = string
}

variable "products_table_arn" {
  description = "ARN tabla DynamoDB products"
  type        = string
}

variable "catalog_availability_table_arn" {
  description = "ARN tabla DynamoDB catalog_availability"
  type        = string
}

variable "catalog_images_bucket_arn" {
  description = "ARN bucket S3 de imagenes de catalogo (seed-runner)"
  type        = string
  default     = null
  nullable    = true
}

variable "invoices_bucket_arn" {
  description = "ARN bucket S3 de facturas PDF"
  type        = string
}

variable "invoices_table_arn" {
  description = "ARN tabla DynamoDB invoices"
  type        = string
}

variable "billing_work_queue_arn" {
  description = "ARN cola SQS billing-work"
  type        = string
}

