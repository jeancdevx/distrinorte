variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "aws_region" {
  type = string
}

variable "task_family" {
  description = "Familia de la task definition (ej. seed-runner)"
  type        = string
}

variable "container_name" {
  type    = string
  default = "main"
}

variable "container_image" {
  type = string
}

variable "container_command" {
  type    = list(string)
  default = []
}

variable "environment_variables" {
  type      = map(string)
  default   = {}
  sensitive = true
}

variable "task_execution_role_arn" {
  type = string
}

variable "task_role_arn" {
  type = string
}

variable "cpu" {
  type    = number
  default = 256
}

variable "memory" {
  type    = number
  default = 512
}

variable "log_retention_in_days" {
  type    = number
  default = 14
}
