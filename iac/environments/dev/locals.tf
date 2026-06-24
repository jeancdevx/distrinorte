locals {
  project_name = var.project_name
  environment  = var.environment

  name_prefix = "${local.project_name}-${local.environment}"

  common_tags = merge(var.tags, {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "terraform"
  })

  edge_dns_enabled = var.route53_domain_name != null

  cloudfront_domain_names = distinct(concat(
    var.cloudfront_portal_aliases,
    var.cloudfront_api_aliases,
    var.cloudfront_assets_aliases,
  ))

  create_acm_certificate = local.edge_dns_enabled && var.cloudfront_acm_certificate_arn == null && length(local.cloudfront_domain_names) > 0

  cloudfront_certificate_arn = var.cloudfront_acm_certificate_arn != null ? var.cloudfront_acm_certificate_arn : (
    local.create_acm_certificate ? module.route53_acm[0].validated_certificate_arn : null
  )

  catalog_assets_base_url = "https://${var.route53_assets_record_name}"

  ecr_image = {
    customers-service = "${module.ecr.repository_urls["customers-service"]}:${var.container_image_tag}"
    inventory-service = "${module.ecr.repository_urls["inventory-service"]}:${var.container_image_tag}"
    orders-service    = "${module.ecr.repository_urls["orders-service"]}:${var.container_image_tag}"
    catalog-service   = "${module.ecr.repository_urls["catalog-service"]}:${var.container_image_tag}"
    seed-runner       = "${module.ecr.repository_urls["seed-runner"]}:${var.container_image_tag}"
  }

  seed_runner_environment = {
    NODE_ENV                = var.environment
    AWS_REGION              = var.aws_region
    DATABASE_HOST           = module.rds.endpoint
    DATABASE_PORT           = tostring(module.rds.port)
    DATABASE_NAME           = module.rds.db_name
    DATABASE_USER           = module.rds.username
    DATABASE_PASSWORD       = var.db_password
    DYNAMODB_PRODUCTS_TABLE = module.dynamodb.products_table_name
    REDIS_HOST              = module.elasticache.primary_endpoint
    REDIS_PORT              = tostring(module.elasticache.port)
    REDIS_AUTH_TOKEN        = var.redis_auth_token
    REDIS_TLS               = tostring(var.redis_transit_encryption_enabled)
    CATALOG_IMAGES_BUCKET   = module.s3.catalog_images_bucket_name
    CATALOG_ASSETS_BASE_URL = local.catalog_assets_base_url
  }
}
