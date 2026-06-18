data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_route53_zone" "main" {
  count = var.route53_domain_name != null ? 1 : 0

  name         = var.route53_domain_name
  private_zone = false
}
