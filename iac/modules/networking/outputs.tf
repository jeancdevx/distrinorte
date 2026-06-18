output "vpc_id" {
  description = "ID de la VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block de la VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs de subnets públicas"
  value       = [for subnet in aws_subnet.public : subnet.id]
}

output "private_subnet_ids" {
  description = "IDs de subnets privadas (compute)"
  value       = [for subnet in aws_subnet.private : subnet.id]
}

output "data_subnet_ids" {
  description = "IDs de subnets de datos (RDS, Redis)"
  value       = [for subnet in aws_subnet.data : subnet.id]
}

output "nat_gateway_ids" {
  description = "IDs de NAT Gateways"
  value       = [for nat in aws_nat_gateway.main : nat.id]
}

output "vpc_endpoints_security_group_id" {
  description = "Security group de interface VPC endpoints (null si deshabilitados)"
  value       = var.enable_vpc_endpoints ? aws_security_group.vpc_endpoints[0].id : null
}
