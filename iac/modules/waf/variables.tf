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

variable "origin_verify_secret" {
  description = "Secreto compartido CloudFront -> API Gateway (header X-Origin-Verify)"
  type        = string
  sensitive   = true
}

variable "api_gateway_stage_arn" {
  description = "ARN del stage API Gateway a proteger"
  type        = string
}

variable "cloudfront_rate_limit" {
  description = "Max requests per 5 minutes per IP en CloudFront WAF"
  type        = number
  default     = 2000
}

variable "api_gateway_rate_limit" {
  description = "Max requests per 5 minutes per IP en API Gateway WAF"
  type        = number
  default     = 1000
}

variable "api_max_body_bytes" {
  description = "Tamano maximo del body HTTP en API Gateway WAF"
  type        = number
  default     = 1048576
}

variable "enable_geo_restriction" {
  description = "Bloquea trafico fuera de allowed_country_codes"
  type        = bool
  default     = false
}

variable "allowed_country_codes" {
  description = "Paises permitidos (ISO 3166-1 alpha-2). Ej. PE para Peru."
  type        = list(string)
  default     = ["PE"]
}

variable "enable_bot_control" {
  description = "Habilita AWS Bot Control (reglas de pago). Desactivado en dev por defecto."
  type        = bool
  default     = false
}

variable "bot_control_inspection_level" {
  description = "Nivel de inspeccion Bot Control (COMMON o TARGETED)"
  type        = string
  default     = "COMMON"
}
