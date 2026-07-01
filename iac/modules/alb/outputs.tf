output "alb_arn" {
  description = "ARN del ALB interno"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "DNS name del ALB interno"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Route53 zone ID del ALB"
  value       = aws_lb.main.zone_id
}

output "http_listener_arn" {
  description = "ARN del listener HTTP"
  value       = aws_lb_listener.http.arn
}

output "orders_target_group_arn" {
  description = "Target group ARN de orders-service"
  value       = aws_lb_target_group.service["orders"].arn
}

output "inventory_target_group_arn" {
  description = "Target group ARN de inventory-service"
  value       = aws_lb_target_group.service["inventory"].arn
}

output "catalog_target_group_arn" {
  description = "Target group ARN de catalog-service"
  value       = aws_lb_target_group.service["catalog"].arn
}

output "customers_target_group_arn" {
  description = "Target group ARN de customers-service"
  value       = aws_lb_target_group.service["customers"].arn
}

output "target_group_arns" {
  description = "Mapa de target group ARNs por servicio"
  value       = { for k, tg in aws_lb_target_group.service : k => tg.arn }
}

output "lb_arn_suffix" {
  description = "Sufijo ARN del ALB para metricas CloudWatch"
  value       = aws_lb.main.arn_suffix
}

output "target_group_arn_suffixes" {
  description = "Mapa de sufijos ARN de target groups por servicio"
  value       = { for k, tg in aws_lb_target_group.service : k => tg.arn_suffix }
}
