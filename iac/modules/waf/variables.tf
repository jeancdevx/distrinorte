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
