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

variable "image_tag_mutability" {
  description = "MUTABLE o IMMUTABLE"
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Habilitar escaneo de imagenes al push"
  type        = bool
  default     = true
}

variable "keep_image_count" {
  description = "Imagenes a conservar por repositorio (lifecycle)"
  type        = number
  default     = 20
}
