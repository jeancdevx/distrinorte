output "validated_certificate_arn" {
  description = "ARN del certificado ACM validado (us-east-1)"
  value       = try(aws_acm_certificate_validation.cloudfront[0].certificate_arn, null)
}

output "certificate_domain_name" {
  description = "Dominio principal del certificado ACM"
  value       = try(aws_acm_certificate.cloudfront[0].domain_name, null)
}

output "portal_fqdn" {
  description = "FQDN del portal en Route53"
  value       = try(aws_route53_record.portal[0].fqdn, null)
}

output "api_fqdn" {
  description = "FQDN de la API en Route53"
  value       = try(aws_route53_record.api[0].fqdn, null)
}

output "assets_fqdn" {
  description = "FQDN de assets en Route53"
  value       = try(aws_route53_record.assets[0].fqdn, null)
}
