resource "aws_acm_certificate" "cloudfront" {
  count = var.create_acm_certificate ? 1 : 0

  provider = aws.us_east_1

  domain_name               = var.domain_names[0]
  subject_alternative_names = length(var.domain_names) > 1 ? slice(var.domain_names, 1, length(var.domain_names)) : []
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-cloudfront-cert"
  })
}
