resource "aws_api_gateway_rest_api" "main" {
  name        = local.api_name
  description = "DistriNorte B2B REST API with VPC Link v2 to internal ALB"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = merge(var.tags, {
    Name = local.api_name
  })
}
