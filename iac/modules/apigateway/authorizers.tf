resource "aws_api_gateway_authorizer" "cognito" {
  name          = "${local.name_prefix}-cognito"
  rest_api_id   = aws_api_gateway_rest_api.main.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [var.cognito_user_pool_arn]

  identity_source = "method.request.header.Authorization"
}
