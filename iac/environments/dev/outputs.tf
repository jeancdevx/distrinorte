output "aws_region" {
  value = var.aws_region
}

output "name_prefix" {
  value = local.name_prefix
}

output "vpc_id" {
  description = "ID de la VPC"
  value       = module.networking.vpc_id
}

output "private_subnet_ids" {
  description = "IDs de subnets privadas"
  value       = module.networking.private_subnet_ids
}

output "data_subnet_ids" {
  description = "IDs de subnets de datos"
  value       = module.networking.data_subnet_ids
}

output "alb_sg_id" {
  description = "Security group del ALB interno"
  value       = module.security_groups.alb_sg_id
}

output "ecs_sg_id" {
  description = "Security group de tasks ECS"
  value       = module.security_groups.ecs_sg_id
}
