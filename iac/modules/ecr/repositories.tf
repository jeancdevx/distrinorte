resource "aws_ecr_repository" "service" {
  for_each = local.repositories

  name                 = "${local.name_prefix}-${each.key}"
  image_tag_mutability = var.image_tag_mutability

  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  tags = merge(var.tags, {
    Name    = "${local.name_prefix}-${each.key}"
    Service = each.key
  })
}

resource "aws_ecr_lifecycle_policy" "service" {
  for_each = local.repositories

  repository = aws_ecr_repository.service[each.key].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.keep_image_count} images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.keep_image_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
