output "aws_region" {
  value = var.aws_region
}

output "name_prefix" {
  value = local.name_prefix
}

# Outputs de módulos — descomentar conforme se implementen

# output "vpc_id" {
#   value = module.networking.vpc_id
# }
