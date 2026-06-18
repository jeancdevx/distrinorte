resource "aws_route53_record" "portal" {
  count = var.create_cloudfront_aliases ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.portal_record_name
  type    = "A"

  alias {
    name                   = var.portal_cloudfront_domain_name
    zone_id                = local.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "portal_ipv6" {
  count = var.create_cloudfront_aliases ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.portal_record_name
  type    = "AAAA"

  alias {
    name                   = var.portal_cloudfront_domain_name
    zone_id                = local.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api" {
  count = var.create_cloudfront_aliases ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.api_record_name
  type    = "A"

  alias {
    name                   = var.api_cloudfront_domain_name
    zone_id                = local.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_ipv6" {
  count = var.create_cloudfront_aliases ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.api_record_name
  type    = "AAAA"

  alias {
    name                   = var.api_cloudfront_domain_name
    zone_id                = local.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "assets" {
  count = var.create_cloudfront_aliases ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.assets_record_name
  type    = "A"

  alias {
    name                   = var.assets_cloudfront_domain_name
    zone_id                = local.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "assets_ipv6" {
  count = var.create_cloudfront_aliases ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.assets_record_name
  type    = "AAAA"

  alias {
    name                   = var.assets_cloudfront_domain_name
    zone_id                = local.cloudfront_zone_id
    evaluate_target_health = false
  }
}
