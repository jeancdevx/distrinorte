data "aws_iam_policy_document" "deploy" {
  statement {
    sid       = "EcrAuth"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid    = "EcrPushPull"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeRepositories",
      "ecr:GetDownloadUrlForLayer",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
    ]
    resources = [
      "arn:aws:ecr:${local.region}:${local.account_id}:repository/${local.name_prefix}-*",
    ]
  }

  statement {
    sid    = "EcsRedeploy"
    effect = "Allow"
    actions = [
      "ecs:DescribeServices",
      "ecs:UpdateService",
    ]
    resources = [
      "arn:aws:ecs:${local.region}:${local.account_id}:service/${local.name_prefix}-cluster/${local.name_prefix}-*",
    ]
  }

  statement {
    sid    = "EcsRunSeedTask"
    effect = "Allow"
    actions = [
      "ecs:DescribeTaskDefinition",
      "ecs:DescribeTasks",
      "ecs:RegisterTaskDefinition",
      "ecs:RunTask",
      "ecs:StopTask",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "Ec2ReadNetworkForSeed"
    effect = "Allow"
    actions = [
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeSubnets",
      "ec2:DescribeVpcs",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "CloudWatchLogsSeed"
    effect = "Allow"
    actions = [
      "logs:DescribeLogStreams",
      "logs:GetLogEvents",
      "logs:FilterLogEvents",
    ]
    resources = [
      "arn:aws:logs:${local.region}:${local.account_id}:log-group:/ecs/${local.name_prefix}-seed-runner:*",
    ]
  }

  statement {
    sid     = "PassEcsTaskRoles"
    effect  = "Allow"
    actions = ["iam:PassRole"]
    resources = [
      "arn:aws:iam::${local.account_id}:role/${local.name_prefix}-ecs-task-execution",
      "arn:aws:iam::${local.account_id}:role/${local.name_prefix}-seed-runner-task",
      "arn:aws:iam::${local.account_id}:role/${local.name_prefix}-customers-service-task",
      "arn:aws:iam::${local.account_id}:role/${local.name_prefix}-inventory-service-task",
      "arn:aws:iam::${local.account_id}:role/${local.name_prefix}-orders-service-task",
      "arn:aws:iam::${local.account_id}:role/${local.name_prefix}-catalog-service-task",
    ]

    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "${local.name_prefix}-github-deploy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}
