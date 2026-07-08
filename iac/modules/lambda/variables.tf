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

variable "execution_role_arn" {
  description = "ARN del IAM role de ejecucion del Lambda"
  type        = string
}

variable "billing_work_queue_arn" {
  description = "ARN de la cola SQS billing-work"
  type        = string
}

variable "event_bus_name" {
  description = "Nombre del custom EventBridge bus"
  type        = string
}

variable "invoices_bucket_name" {
  description = "Nombre del bucket S3 de facturas"
  type        = string
}

variable "invoices_table_name" {
  description = "Nombre de la tabla DynamoDB invoices"
  type        = string
}

variable "invoices_customer_gsi_name" {
  description = "Nombre del GSI customerId en invoices"
  type        = string
}

variable "source_zip_path" {
  description = "Ruta al zip del handler; null usa placeholder embebido"
  type        = string
  default     = null
  nullable    = true
}

variable "allow_placeholder_zip" {
  description = "Permite usar el placeholder.zip cuando source_zip_path es null (solo para bootstrap local)"
  type        = bool
  default     = false
}

variable "handler" {
  description = "Handler del Lambda"
  type        = string
  default     = "index.handler"
}

variable "runtime" {
  description = "Runtime del Lambda"
  type        = string
  default     = "nodejs24.x"
}

variable "timeout_seconds" {
  description = "Timeout del Lambda en segundos"
  type        = number
  default     = 60
}

variable "memory_size" {
  description = "Memoria del Lambda en MB"
  type        = number
  default     = 256
}

variable "sqs_batch_size" {
  description = "Batch size del event source mapping SQS"
  type        = number
  default     = 1
}

variable "log_retention_in_days" {
  description = "Retencion de logs CloudWatch"
  type        = number
  default     = 14
}
