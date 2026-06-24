data "aws_caller_identity" "current" {}

data "tls_certificate" "github_actions" {
  count = var.enable_github_actions_oidc ? 1 : 0

  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_openid_connect_provider" "github_actions" {
  count = var.enable_github_actions_oidc ? 1 : 0

  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  thumbprint_list = [
    data.tls_certificate.github_actions[0].certificates[0].sha1_fingerprint,
  ]

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-github-oidc"
  })
}

data "aws_iam_policy_document" "github_actions_assume" {
  count = var.enable_github_actions_oidc ? 1 : 0

  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github_actions[0].arn]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        for branch in var.github_oidc_branches :
        "repo:${var.github_repository}:ref:refs/heads/${branch}"
      ]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  count = var.enable_github_actions_oidc ? 1 : 0

  name               = "${local.name_prefix}-github-actions"
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume[0].json

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-github-actions"
  })
}

data "aws_iam_policy_document" "github_actions_deploy" {
  count = var.enable_github_actions_oidc ? 1 : 0

  statement {
    sid    = "EcrAuth"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "EcrPush"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
    ]
    resources = var.ecr_repository_arns
  }

  statement {
    sid    = "EcsRunSeedAndDeploy"
    effect = "Allow"
    actions = [
      "ecs:RunTask",
      "ecs:DescribeTasks",
      "ecs:DescribeTaskDefinition",
      "ecs:DescribeServices",
      "ecs:UpdateService",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "EcsPassRoles"
    effect = "Allow"
    actions = ["iam:PassRole"]
    resources = [
      aws_iam_role.ecs_task_execution.arn,
      aws_iam_role.seed_runner.arn,
      aws_iam_role.customers_service.arn,
      aws_iam_role.inventory_service.arn,
      aws_iam_role.orders_service.arn,
      aws_iam_role.catalog_service.arn,
    ]
  }

  statement {
    sid    = "EcsRunTaskNetwork"
    effect = "Allow"
    actions = [
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeVpcs",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "CloudWatchLogsSeed"
    effect = "Allow"
    actions = [
      "logs:GetLogEvents",
      "logs:FilterLogEvents",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "github_actions_deploy" {
  count = var.enable_github_actions_oidc ? 1 : 0

  name        = "${local.name_prefix}-github-actions-deploy"
  description = "ECR push + ECS deploy/run-task para GitHub Actions"
  policy      = data.aws_iam_policy_document.github_actions_deploy[0].json

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-github-actions-deploy"
  })
}

resource "aws_iam_role_policy_attachment" "github_actions_deploy" {
  count = var.enable_github_actions_oidc ? 1 : 0

  role       = aws_iam_role.github_actions[0].name
  policy_arn = aws_iam_policy.github_actions_deploy[0].arn
}

resource "aws_iam_role_policy_attachment" "github_actions_power_user" {
  count = var.enable_github_actions_oidc && var.github_actions_attach_power_user ? 1 : 0

  role       = aws_iam_role.github_actions[0].name
  policy_arn = "arn:aws:iam::aws:policy/PowerUserAccess"
}
