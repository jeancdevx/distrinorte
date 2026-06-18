resource "aws_wafv2_web_acl" "api_gateway" {
  name  = "${local.name_prefix}-api-gw"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "BlockMissingOriginVerify"
    priority = 1

    action {
      block {}
    }

    statement {
      not_statement {
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
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "BlockMissingOriginVerify"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "RateLimitApiPerIp"
    priority = 2

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = var.api_gateway_rate_limit
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitApiPerIp"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "BlockLargeRequestBody"
    priority = 3

    action {
      block {}
    }

    statement {
      size_constraint_statement {
        comparison_operator = "GT"
        size                = var.api_max_body_bytes

        field_to_match {
          body {
            oversize_handling = "CONTINUE"
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
      metric_name                = "BlockLargeRequestBody"
      sampled_requests_enabled   = true
    }
  }

  dynamic "rule" {
    for_each = local.managed_rule_groups
    content {
      name     = rule.value
      priority = local.api_managed_rule_priorities[rule.value]

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = rule.value
          vendor_name = "AWS"
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = rule.value
        sampled_requests_enabled   = true
      }
    }
  }

  dynamic "rule" {
    for_each = var.enable_geo_restriction ? [1] : []
    content {
      name     = "GeoAllowList"
      priority = local.api_geo_rule_priority

      action {
        block {}
      }

      statement {
        not_statement {
          statement {
            geo_match_statement {
              country_codes = var.allowed_country_codes
            }
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "GeoAllowList"
        sampled_requests_enabled   = true
      }
    }
  }

  dynamic "rule" {
    for_each = var.enable_bot_control ? [1] : []
    content {
      name     = "AWSManagedRulesBotControlRuleSet"
      priority = local.api_bot_rule_priority

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesBotControlRuleSet"
          vendor_name = "AWS"

          managed_rule_group_configs {
            aws_managed_rules_bot_control_rule_set {
              inspection_level = var.bot_control_inspection_level
            }
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "AWSManagedRulesBotControlRuleSet"
        sampled_requests_enabled   = true
      }
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
