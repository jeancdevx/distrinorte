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

variable "vpc_id" {
  description = "ID de la VPC"
  type        = string
}

variable "subnet_ids" {
  description = "Subnets privadas para el ALB interno"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security groups del ALB"
  type        = list(string)
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener. If null, only HTTP is configured."
  type        = string
  default     = null
  nullable    = true
}

variable "ssl_policy" {
  description = "SSL policy for HTTPS listener"
  type        = string
  default     = "ELBSecurityPolicy-TLS13-1-2-2021-06"
}

variable "health_check_path" {
  description = "Health check path for target groups"
  type        = string
  default     = "/health"
}

variable "deregistration_delay" {
  description = "Target deregistration delay in seconds"
  type        = number
  default     = 30
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection on the ALB"
  type        = bool
  default     = false
}
