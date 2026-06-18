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

variable "billing_mode" {
  description = "Modo de facturacion DynamoDB"
  type        = string
  default     = "PAY_PER_REQUEST"

  validation {
    condition     = contains(["PAY_PER_REQUEST", "PROVISIONED"], var.billing_mode)
    error_message = "billing_mode debe ser PAY_PER_REQUEST o PROVISIONED."
  }
}

variable "read_capacity" {
  description = "RCU si billing_mode = PROVISIONED"
  type        = number
  default     = 5
}

variable "write_capacity" {
  description = "WCU si billing_mode = PROVISIONED"
  type        = number
  default     = 5
}

variable "enable_point_in_time_recovery" {
  description = "Habilitar PITR en la tabla products"
  type        = bool
  default     = false
}

variable "enable_encryption" {
  description = "Cifrado en reposo con clave administrada por DynamoDB"
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Proteccion contra borrado accidental"
  type        = bool
  default     = false
}
