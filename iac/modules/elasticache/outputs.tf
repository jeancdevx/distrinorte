output "primary_endpoint" {
  description = "Endpoint primario de Redis"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "reader_endpoint" {
  description = "Endpoint de lectura (null con un solo nodo)"
  value       = aws_elasticache_replication_group.main.reader_endpoint_address
}

output "port" {
  description = "Puerto Redis"
  value       = aws_elasticache_replication_group.main.port
}

output "replication_group_id" {
  description = "ID del replication group"
  value       = aws_elasticache_replication_group.main.id
}

output "arn" {
  description = "ARN del replication group"
  value       = aws_elasticache_replication_group.main.arn
}
