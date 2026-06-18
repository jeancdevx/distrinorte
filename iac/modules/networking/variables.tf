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

variable "vpc_cidr" {
  description = "CIDR block de la VPC"
  type        = string
}

variable "azs" {
  description = "Availability zones a usar"
  type        = list(string)

  validation {
    condition     = length(var.azs) >= 2
    error_message = "Se requieren al menos 2 availability zones."
  }
}

variable "public_subnet_cidrs" {
  description = "CIDRs de subnets públicas (una por AZ)"
  type        = list(string)

  validation {
    condition     = length(var.public_subnet_cidrs) == length(var.azs)
    error_message = "public_subnet_cidrs debe tener la misma cantidad de elementos que azs."
  }
}

variable "private_subnet_cidrs" {
  description = "CIDRs de subnets privadas para compute (una por AZ)"
  type        = list(string)

  validation {
    condition     = length(var.private_subnet_cidrs) == length(var.azs)
    error_message = "private_subnet_cidrs debe tener la misma cantidad de elementos que azs."
  }
}

variable "data_subnet_cidrs" {
  description = "CIDRs de subnets de datos para RDS y Redis (una por AZ)"
  type        = list(string)

  validation {
    condition     = length(var.data_subnet_cidrs) == length(var.azs)
    error_message = "data_subnet_cidrs debe tener la misma cantidad de elementos que azs."
  }
}

variable "enable_nat_gateway" {
  description = "Crear NAT Gateway(s) para subnets privadas"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Usar un solo NAT Gateway (dev); false = uno por AZ (staging/prod)"
  type        = bool
  default     = true
}

variable "enable_vpc_endpoints" {
  description = "Crear VPC endpoints (gateway + interface) para tráfico privado a AWS"
  type        = bool
  default     = true
}
