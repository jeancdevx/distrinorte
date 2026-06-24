resource "aws_lb_target_group" "service" {
  for_each = local.services

  name        = "${local.name_prefix}-${each.key}-tg"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = each.value.health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200"
  }

  deregistration_delay = var.deregistration_delay

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-${each.key}-tg"
  })
}
