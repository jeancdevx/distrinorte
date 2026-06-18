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
  description = "Region AWS del origen S3 y API Gateway"
  type        = string
}

variable "portal_spa_bucket_name" {
  description = "Nombre del bucket portal SPA"
  type        = string
}

variable "portal_spa_bucket_arn" {
  description = "ARN del bucket portal SPA"
  type        = string
}

variable "catalog_images_bucket_name" {
  description = "Nombre del bucket de imagenes de catalogo"
  type        = string
}

variable "catalog_images_bucket_arn" {
  description = "ARN del bucket de imagenes de catalogo"
  type        = string
}

variable "api_gateway_rest_api_id" {
  description = "ID del REST API Gateway"
  type        = string
}

variable "api_gateway_stage_name" {
  description = "Nombre del stage API Gateway (origin path)"
  type        = string
}

variable "origin_verify_secret" {
  description = "Secreto enviado en header X-Origin-Verify hacia API Gateway"
  type        = string
  sensitive   = true
}

variable "portal_aliases" {
  description = "Aliases CloudFront del portal (ej. pedidos.distrinorte.pe)"
  type        = list(string)
  default     = []
}

variable "api_aliases" {
  description = "Aliases CloudFront de la API (ej. api.pedidos.distrinorte.pe)"
  type        = list(string)
  default     = []
}

variable "assets_aliases" {
  description = "Aliases CloudFront de assets (ej. assets.distrinorte.pe)"
  type        = list(string)
  default     = []
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN in us-east-1 for custom domains"
  type        = string
  default     = null
  nullable    = true
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}
