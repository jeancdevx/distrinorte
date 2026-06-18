resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      [
        for key in sort(keys(local.services)) : aws_api_gateway_resource.service[key].id
      ],
      [
        for key in sort(keys(local.services)) : aws_api_gateway_resource.service_proxy[key].id
      ],
      [
        for key in sort(keys(local.services)) : aws_api_gateway_method.service_root[key].id
      ],
      [
        for key in sort(keys(local.services)) : aws_api_gateway_method.service_proxy[key].id
      ],
      [
        for key in sort(keys(local.services)) : aws_api_gateway_integration.service_root[key].id
      ],
      [
        for key in sort(keys(local.services)) : aws_api_gateway_integration.service_proxy[key].id
      ],
      aws_api_gateway_authorizer.cognito.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.service_root,
    aws_api_gateway_integration.service_proxy,
  ]
}
