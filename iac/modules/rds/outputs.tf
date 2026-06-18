output "endpoint" {
  description = "Hostname del endpoint RDS"
  value       = aws_db_instance.main.address
}

output "port" {
  description = "Puerto PostgreSQL"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "Nombre de la base de datos"
  value       = aws_db_instance.main.db_name
}

output "username" {
  description = "Usuario maestro"
  value       = aws_db_instance.main.username
}

output "instance_arn" {
  description = "ARN de la instancia RDS"
  value       = aws_db_instance.main.arn
}

output "instance_id" {
  description = "Identificador de la instancia RDS"
  value       = aws_db_instance.main.id
}
