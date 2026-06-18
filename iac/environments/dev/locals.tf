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

  cloudfront_certificate_arn = coalesce(
    var.cloudfront_acm_certificate_arn,
    try(module.route53_acm[0].validated_certificate_arn, null),
  )
}
