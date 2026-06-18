resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.name_prefix}-redis-subnet"
  subnet_ids = var.data_subnet_ids

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-redis-subnet"
  })
}
