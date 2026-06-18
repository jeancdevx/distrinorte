locals {
  name_prefix = "${var.project_name}-${var.environment}"
  account_id  = data.aws_caller_identity.current.account_id

  portal_spa_bucket_name     = "${local.name_prefix}-portal-spa-${local.account_id}"
  catalog_images_bucket_name = "${local.name_prefix}-catalog-images-${local.account_id}"
  backups_bucket_name        = "${local.name_prefix}-backups-${local.account_id}"
}
