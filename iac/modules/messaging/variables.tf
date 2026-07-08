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

variable "event_source" {
  description = "Source de eventos publicados (debe coincidir con packages/events)"
  type        = string
  default     = "distrinorte"
}

variable "message_retention_seconds" {
  description = "Retencion de mensajes en colas principales"
  type        = number
  default     = 345600
}

variable "dlq_message_retention_seconds" {
  description = "Retencion de mensajes en DLQs"
  type        = number
  default     = 1209600
}

variable "visibility_timeout_seconds" {
  description = "Visibility timeout de las colas (>= tiempo maximo de procesamiento del consumer)"
  type        = number
  default     = 60
}

variable "billing_visibility_timeout_seconds" {
  description = "Visibility timeout de billing-work (>= timeout del invoice-worker Lambda)"
  type        = number
  default     = 120
}

variable "max_receive_count" {
  description = "Recepciones antes de enviar mensaje a DLQ"
  type        = number
  default     = 5
}
