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
  description = "Region AWS para URLs del issuer"
  type        = string
}

variable "user_pool_domain" {
  description = "Dominio Cognito hosted UI (default && null usa name_prefix)"
  type        = string
  default     = null
  nullable    = true
}

variable "callback_urls" {
  description = "OAuth callback URLs del SPA"
  type        = list(string)
  default     = ["http://localhost:5173/callback"]
}

variable "logout_urls" {
  description = "OAuth logout URLs del SPA"
  type        = list(string)
  default     = ["http://localhost:5173/"]
}

variable "password_minimum_length" {
  description = "Longitud minima de contrasena"
  type        = number
  default     = 12
}

variable "mfa_configuration" {
  description = "MFA del user pool (OFF, ON, OPTIONAL)"
  type        = string
  default     = "OFF"
}

variable "advanced_security_mode" {
  description = "Cognito advanced security (OFF, AUDIT, ENFORCED)"
  type        = string
  default     = "OFF"
}

variable "deletion_protection" {
  description = "Proteccion contra borrado del user pool"
  type        = bool
  default     = false
}

variable "access_token_validity_hours" {
  description = "Validez del access token en horas"
  type        = number
  default     = 1
}

variable "id_token_validity_hours" {
  description = "Validez del id token en horas"
  type        = number
  default     = 1
}

variable "refresh_token_validity_days" {
  description = "Validez del refresh token en dias"
  type        = number
  default     = 30
}
