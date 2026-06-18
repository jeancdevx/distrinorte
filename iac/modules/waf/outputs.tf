output "api_gateway_web_acl_arn" {
  description = "ARN del WAF regional del API Gateway"
  value       = aws_wafv2_web_acl.api_gateway.arn
}

output "api_gateway_web_acl_id" {
  description = "ID del WAF regional del API Gateway"
  value       = aws_wafv2_web_acl.api_gateway.id
}

output "cloudfront_web_acl_arn" {
  description = "ARN del WAF global (CloudFront scope, us-east-1)"
  value       = aws_wafv2_web_acl.cloudfront.arn
}

output "cloudfront_web_acl_id" {
  description = "ID del WAF global de CloudFront"
  value       = aws_wafv2_web_acl.cloudfront.id
}
