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

variable "subnet_ids" {
  description = "Subnets privadas para VPC Link v2"
  type        = list(string)
}

variable "vpc_link_security_group_ids" {
  description = "Security groups del VPC Link v2"
  type        = list(string)
}

variable "alb_arn" {
  description = "ARN del ALB interno"
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name del ALB interno"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "ARN del Cognito User Pool para el authorizer"
  type        = string
}

variable "stage_name" {
  description = "Nombre del stage API Gateway"
  type        = string
}
