resource "aws_wafv2_web_acl" "api_gateway" {
  name  = "${local.name_prefix}-api-gw"
  scope = "REGIONAL"

  default_action {
    block {}
  }

  rule {
    name     = "AllowCloudFrontOriginVerify"
    priority = 1

    action {
      allow {}
    }

    statement {
      byte_match_statement {
        search_string         = var.origin_verify_secret
        positional_constraint = "EXACTLY"

        field_to_match {
          single_header {
            name = "x-origin-verify"
          }
        }

        text_transformation {
          priority = 0
          type     = "NONE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AllowCloudFrontOriginVerify"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${local.name_prefix}-api-gw-waf"
    sampled_requests_enabled   = true
  }

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-api-gw-waf"
  })
}

resource "aws_wafv2_web_acl_association" "api_gateway" {
  resource_arn = var.api_gateway_stage_arn
  web_acl_arn  = aws_wafv2_web_acl.api_gateway.arn
}
