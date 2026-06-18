locals {
  name_prefix = "${var.project_name}-${var.environment}"

  managed_rule_groups = [
    "AWSManagedRulesAmazonIpReputationList",
    "AWSManagedRulesAnonymousIpList",
    "AWSManagedRulesKnownBadInputsRuleSet",
    "AWSManagedRulesCommonRuleSet",
    "AWSManagedRulesSQLiRuleSet",
  ]

  api_managed_rule_priorities = {
    AWSManagedRulesAmazonIpReputationList = 10
    AWSManagedRulesAnonymousIpList        = 20
    AWSManagedRulesKnownBadInputsRuleSet  = 30
    AWSManagedRulesCommonRuleSet          = 40
    AWSManagedRulesSQLiRuleSet            = 50
  }

  cloudfront_managed_rule_priorities = {
    AWSManagedRulesAmazonIpReputationList = 10
    AWSManagedRulesAnonymousIpList        = 20
    AWSManagedRulesKnownBadInputsRuleSet  = 30
    AWSManagedRulesCommonRuleSet          = 40
    AWSManagedRulesSQLiRuleSet            = 50
  }

  api_geo_rule_priority        = 60
  cloudfront_geo_rule_priority = 60
  api_bot_rule_priority        = 70
  cloudfront_bot_rule_priority = 70
}
