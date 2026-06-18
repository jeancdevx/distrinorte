resource "aws_security_group" "vpc_link" {
  name_prefix = "${local.name_prefix}-vpc-link-"
  description = "VPC Link v2 ENIs - API Gateway to internal ALB"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-vpc-link-sg"
  })
}

# API Gateway VPC Link v2 requiere ingress abierto en los puertos del listener del ALB.
resource "aws_vpc_security_group_ingress_rule" "vpc_link_http" {
  security_group_id = aws_security_group.vpc_link.id
  description       = "HTTP from API Gateway via VPC Link"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "vpc_link_https" {
  security_group_id = aws_security_group.vpc_link.id
  description       = "HTTPS from API Gateway via VPC Link"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "vpc_link_to_alb_http" {
  security_group_id            = aws_security_group.vpc_link.id
  description                  = "HTTP to internal ALB"
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 80
  to_port                      = 80
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "vpc_link_to_alb_https" {
  security_group_id            = aws_security_group.vpc_link.id
  description                  = "HTTPS to internal ALB"
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
}
