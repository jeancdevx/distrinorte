resource "aws_api_gateway_integration" "service_root" {
  for_each = local.services

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.service[each.key].id
  http_method = aws_api_gateway_method.service_root[each.key].http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  connection_type         = "VPC_LINK"
  connection_id           = aws_apigatewayv2_vpc_link.main.id
  integration_target      = var.alb_arn
  uri                     = "http://${var.alb_dns_name}/${each.value.path}"
}

resource "aws_api_gateway_integration" "service_proxy" {
  for_each = local.services

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.service_proxy[each.key].id
  http_method = aws_api_gateway_method.service_proxy[each.key].http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  connection_type         = "VPC_LINK"
  connection_id           = aws_apigatewayv2_vpc_link.main.id
  integration_target      = var.alb_arn
  uri                     = "http://${var.alb_dns_name}/${each.value.path}/{proxy}"

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}
