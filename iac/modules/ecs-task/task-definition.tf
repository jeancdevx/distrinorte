resource "aws_cloudwatch_log_group" "main" {
  name              = "/ecs/${local.task_family}"
  retention_in_days = var.log_retention_in_days

  tags = merge(var.tags, {
    Name = local.task_family
  })
}

resource "aws_ecs_task_definition" "main" {
  family                   = local.task_family
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.task_execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    merge(
      {
        name      = var.container_name
        image     = var.container_image
        essential = true

        environment = [
          for key, value in var.environment_variables : {
            name  = key
            value = value
          }
        ]

        logConfiguration = {
          logDriver = "awslogs"
          options = {
            awslogs-group         = aws_cloudwatch_log_group.main.name
            awslogs-region        = var.aws_region
            awslogs-stream-prefix = var.container_name
          }
        }
      },
      length(var.container_command) > 0 ? { command = var.container_command } : {}
    )
  ])

  tags = merge(var.tags, {
    Name = local.task_family
  })
}
