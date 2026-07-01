resource "aws_rds_cluster" "main" {
  count = var.use_aurora ? 1 : 0

  cluster_identifier = "${local.name_prefix}-aurora"
  engine             = "aurora-postgresql"
  engine_version     = var.engine_version
  engine_mode        = "provisioned"

  database_name   = var.db_name
  master_username = var.db_username
  master_password = var.db_password
  port            = 5432

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = var.security_group_ids

  storage_encrypted            = true
  backup_retention_period      = var.backup_retention_period
  preferred_backup_window      = "03:00-04:00"
  preferred_maintenance_window = "mon:04:00-mon:05:00"

  deletion_protection = var.deletion_protection
  skip_final_snapshot = var.skip_final_snapshot
  final_snapshot_identifier = (
    var.skip_final_snapshot ? null : "${local.name_prefix}-aurora-final"
  )

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-aurora"
  })
}

resource "aws_rds_cluster_instance" "main" {
  count = var.use_aurora ? 1 : 0

  identifier         = "${local.name_prefix}-aurora-1"
  cluster_identifier = aws_rds_cluster.main[0].id
  engine             = aws_rds_cluster.main[0].engine
  engine_version     = aws_rds_cluster.main[0].engine_version
  instance_class     = var.aurora_instance_class

  performance_insights_enabled = var.performance_insights_enabled
  auto_minor_version_upgrade   = true

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-aurora-1"
  })
}
