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

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}

variable "create_acm_certificate" {
  description = "Crea certificado ACM + registros CNAME de validacion DNS"
  type        = bool
  default     = false
}

variable "create_cloudfront_aliases" {
  description = "Crea registros A/AAAA alias hacia distribuciones CloudFront"
  type        = bool
  default     = false
}

variable "domain_names" {
  description = "FQDNs del certificado ACM (requerido si create_acm_certificate)"
  type        = list(string)
  default     = []
}

variable "portal_record_name" {
  description = "FQDN del portal SPA"
  type        = string
  default     = "pedidos.galaxymorph.com"
}

variable "api_record_name" {
  description = "FQDN del proxy API"
  type        = string
  default     = "api.pedidos.galaxymorph.com"
}

variable "assets_record_name" {
  description = "FQDN del CDN de assets"
  type        = string
  default     = "assets.galaxymorph.com"
}

variable "portal_cloudfront_domain_name" {
  description = "Domain name CloudFront del portal (requerido si create_cloudfront_aliases)"
  type        = string
  default     = null
  nullable    = true
}

variable "api_cloudfront_domain_name" {
  description = "Domain name CloudFront de la API (requerido si create_cloudfront_aliases)"
  type        = string
  default     = null
  nullable    = true
}

variable "assets_cloudfront_domain_name" {
  description = "Domain name CloudFront de assets (requerido si create_cloudfront_aliases)"
  type        = string
  default     = null
  nullable    = true
}
