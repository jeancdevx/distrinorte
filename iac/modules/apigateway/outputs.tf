output "rest_api_id" {
  description = "ID del REST API"
  value       = aws_api_gateway_rest_api.main.id
}

output "rest_api_arn" {
  description = "ARN del REST API"
  value       = aws_api_gateway_rest_api.main.arn
}

output "execution_arn" {
  description = "ARN de ejecucion del REST API"
  value       = aws_api_gateway_rest_api.main.execution_arn
}

output "vpc_link_id" {
  description = "ID del VPC Link v2"
  value       = aws_apigatewayv2_vpc_link.main.id
}

output "stage_name" {
  description = "Nombre del stage activo"
  value       = aws_api_gateway_stage.main.stage_name
}

output "stage_invoke_url" {
  description = "URL base del stage (sin path de servicio)"
  value       = aws_api_gateway_stage.main.invoke_url
}

output "stage_arn" {
  description = "ARN del stage API Gateway"
  value       = aws_api_gateway_stage.main.arn
}

output "authorizer_id" {
  description = "ID del Cognito authorizer"
  value       = aws_api_gateway_authorizer.cognito.id
}
