resource "aws_iam_role" "customers_service" {
  name               = "${local.name_prefix}-customers-service-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-customers-service-task"
    Service = "customers-service"
  })
}

resource "aws_iam_role" "inventory_service" {
  name               = "${local.name_prefix}-inventory-service-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-inventory-service-task"
    Service = "inventory-service"
  })
}

resource "aws_iam_role" "orders_service" {
  name               = "${local.name_prefix}-orders-service-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-orders-service-task"
    Service = "orders-service"
  })
}

resource "aws_iam_role" "catalog_service" {
  name               = "${local.name_prefix}-catalog-service-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-catalog-service-task"
    Service = "catalog-service"
  })
}
