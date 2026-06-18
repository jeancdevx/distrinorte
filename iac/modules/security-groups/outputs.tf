output "vpc_link_sg_id" {
  description = "Security group para VPC Link v2"
  value       = aws_security_group.vpc_link.id
}

output "alb_sg_id" {
  description = "Security group para ALB interno"
  value       = aws_security_group.alb.id
}

output "ecs_sg_id" {
  description = "Security group para tasks ECS Fargate"
  value       = aws_security_group.ecs.id
}

output "rds_sg_id" {
  description = "Security group para RDS PostgreSQL"
  value       = aws_security_group.rds.id
}

output "redis_sg_id" {
  description = "Security group para ElastiCache Redis"
  value       = aws_security_group.redis.id
}
