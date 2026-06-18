resource "aws_apigatewayv2_vpc_link" "main" {
  name               = "${local.name_prefix}-vpc-link"
  security_group_ids = var.vpc_link_security_group_ids
  subnet_ids         = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-vpc-link"
  })
}
