variable "aws_region" {
  description = "Región AWS"
  type        = string
  default     = "us-east-2"
}

variable "aws_profile" {
  description = "Perfil AWS CLI (SSO). Dejar null para credenciales por defecto"
  type        = string
  default     = null
  nullable    = true
}

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "distrinorte"
}

variable "environment" {
  description = "Entorno bootstrap"
  type        = string
  default     = "bootstrap"
}

variable "state_bucket_name_override" {
  description = "Nombre fijo del bucket tfstate (globalmente único). Si es null, se genera automáticamente"
  type        = string
  default     = null
  nullable    = true
}

variable "enable_versioning" {
  description = "Habilitar versionado en el bucket de state"
  type        = bool
  default     = true
}

variable "enable_lifecycle_rules" {
  description = "Habilitar reglas de lifecycle en el bucket de state"
  type        = bool
  default     = true
}

variable "lifecycle_noncurrent_days" {
  description = "Días antes de expirar versiones no actuales"
  type        = number
  default     = 90
}

variable "tags" {
  description = "Tags adicionales"
  type        = map(string)
  default     = {}
}
