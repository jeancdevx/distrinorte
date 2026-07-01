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

  ecs_service_names = toset([
    "customers-service",
    "inventory-service",
    "orders-service",
    "catalog-service",
    "seed-runner",
  ])

  ecs_image_tag = {
    for name in local.ecs_service_names :
    name => lookup(var.container_image_tags, name, var.container_image_tag)
  }

  ecr_image = {
    for name in local.ecs_service_names :
    name => "${module.ecr.repository_urls[name]}:${local.ecs_image_tag[name]}"
  }

  seed_runner_environment = {
    NODE_ENV                            = var.environment
    AWS_REGION                          = var.aws_region
    EVENT_BUS_NAME                      = module.messaging.event_bus_name
    DATABASE_HOST                       = module.rds.endpoint
    DATABASE_PORT                       = tostring(module.rds.port)
    DATABASE_ADMIN_NAME                 = module.rds.db_name
    DATABASE_NAME_CUSTOMERS             = module.rds.service_database_names.customers
    DATABASE_NAME_ORDERS                = module.rds.service_database_names.orders
    DATABASE_NAME_INVENTORY             = module.rds.service_database_names.inventory
    DATABASE_USER                       = module.rds.username
    DATABASE_PASSWORD                   = var.db_password
    LEGACY_DATABASE_NAME                = module.rds.db_name
    DYNAMODB_PRODUCTS_TABLE             = module.dynamodb.products_table_name
    DYNAMODB_CATALOG_AVAILABILITY_TABLE = module.dynamodb.catalog_availability_table_name
    REDIS_HOST                          = module.elasticache.primary_endpoint
    REDIS_PORT                          = tostring(module.elasticache.port)
    REDIS_AUTH_TOKEN                    = var.redis_auth_token
    REDIS_TLS                           = tostring(var.redis_transit_encryption_enabled)
    CATALOG_IMAGES_BUCKET               = module.s3.catalog_images_bucket_name
    CATALOG_ASSETS_BASE_URL             = local.catalog_assets_base_url
  }
}
