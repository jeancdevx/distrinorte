locals {
  name_prefix = "${var.project_name}-${var.environment}"

  az_subnet_map = {
    for idx, az in var.azs : az => {
      public_cidr  = var.public_subnet_cidrs[idx]
      private_cidr = var.private_subnet_cidrs[idx]
      data_cidr    = var.data_subnet_cidrs[idx]
    }
  }

  nat_count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.azs)) : 0
  nat_azs   = var.single_nat_gateway ? [var.azs[0]] : var.azs

  private_route_table_count = var.enable_nat_gateway ? local.nat_count : 1

  interface_endpoint_services = {
    ecr_api        = "ecr.api"
    ecr_dkr        = "ecr.dkr"
    logs           = "logs"
    ssm            = "ssm"
    secretsmanager = "secretsmanager"
    sqs            = "sqs"
    events         = "events"
  }
}
