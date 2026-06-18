resource "aws_ecs_task_definition" "main" {
  family                   = local.service_name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.task_execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    merge(
      {
        name      = var.service_name
        image     = var.container_image
        essential = true

        portMappings = [
          {
            containerPort = var.container_port
            hostPort      = var.container_port
            protocol      = "tcp"
          }
        ]

        environment = [
          for key, value in var.environment_variables : {
            name  = key
            value = value
          }
        ]

        logConfiguration = {
          logDriver = "awslogs"
          options = {
            awslogs-group         = aws_cloudwatch_log_group.service.name
            awslogs-region        = var.aws_region
            awslogs-stream-prefix = var.service_name
          }
        }
      },
      length(var.container_command) > 0 ? { command = var.container_command } : {}
    )
  ])

  tags = merge(var.tags, {
    Name    = local.service_name
    Service = var.service_name
  })
}
