output "endpoint" {
  description = "Hostname del endpoint de PostgreSQL (RDS o Aurora)"
  value       = var.use_aurora ? aws_rds_cluster.main[0].endpoint : aws_db_instance.main[0].address
}

output "port" {
  description = "Puerto PostgreSQL"
  value       = var.use_aurora ? aws_rds_cluster.main[0].port : aws_db_instance.main[0].port
}

output "db_name" {
  description = "Base de datos administrativa creada por el motor (legacy/bootstrap)"
  value       = var.use_aurora ? aws_rds_cluster.main[0].database_name : aws_db_instance.main[0].db_name
}

output "username" {
  description = "Usuario maestro"
  value       = var.use_aurora ? aws_rds_cluster.main[0].master_username : aws_db_instance.main[0].username
}

output "instance_arn" {
  description = "ARN del cluster o instancia"
  value       = var.use_aurora ? aws_rds_cluster.main[0].arn : aws_db_instance.main[0].arn
}

output "instance_id" {
  description = "Identificador del cluster o instancia"
  value       = var.use_aurora ? aws_rds_cluster.main[0].cluster_identifier : aws_db_instance.main[0].id
}

output "use_aurora" {
  description = "Indica si el entorno usa Aurora PostgreSQL"
  value       = var.use_aurora
}

output "service_database_names" {
  description = "Bases logicas por microservicio (database per service)"
  value       = var.service_database_names
}
