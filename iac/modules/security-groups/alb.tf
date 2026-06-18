resource "aws_security_group" "alb" {
  name_prefix = "${local.name_prefix}-alb-"
  description = "Internal ALB - ingress from VPC Link, egress to ECS"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-alb-sg"
  })
}

resource "aws_vpc_security_group_ingress_rule" "alb_from_vpc_link_http" {
  security_group_id            = aws_security_group.alb.id
  description                  = "HTTP from VPC Link"
  referenced_security_group_id = aws_security_group.vpc_link.id
  from_port                    = 80
  to_port                      = 80
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "alb_from_vpc_link_https" {
  security_group_id            = aws_security_group.alb.id
  description                  = "HTTPS from VPC Link"
  referenced_security_group_id = aws_security_group.vpc_link.id
  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "alb_to_ecs" {
  security_group_id            = aws_security_group.alb.id
  description                  = "Traffic to ECS tasks"
  referenced_security_group_id = aws_security_group.ecs.id
  from_port                    = var.ecs_container_port_from
  to_port                      = var.ecs_container_port_to
  ip_protocol                  = "tcp"
}
