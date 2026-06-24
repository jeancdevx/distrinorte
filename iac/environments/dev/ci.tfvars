aws_region  = "us-east-2"
project_name = "distrinorte"
environment  = "dev"

vpc_cidr = "10.0.0.0/16"

azs = ["us-east-2a", "us-east-2b", "us-east-2c"]

public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
data_subnet_cidrs    = ["10.0.20.0/24", "10.0.21.0/24", "10.0.22.0/24"]

enable_nat_gateway   = true
single_nat_gateway   = true
enable_vpc_endpoints = true

s3_force_destroy           = true
s3_enable_versioning       = true
s3_backups_noncurrent_days = 90

dynamodb_billing_mode        = "PAY_PER_REQUEST"
dynamodb_enable_pitr         = false
dynamodb_deletion_protection = false

db_engine_version               = "17.7"
db_instance_class               = "db.t4g.medium"
db_allocated_storage            = 20
db_max_allocated_storage        = 100
db_multi_az                     = false
db_backup_retention_period      = 7
db_deletion_protection          = false
db_skip_final_snapshot          = true
db_performance_insights_enabled = false

redis_engine_version             = "7.1"
redis_node_type                  = "cache.t4g.micro"
redis_num_cache_clusters         = 1
redis_transit_encryption_enabled = true
redis_snapshot_retention_limit   = 7

waf_enable_geo_restriction = false
waf_allowed_country_codes  = ["PE"]
waf_enable_bot_control     = false
waf_cloudfront_rate_limit  = 2000
waf_api_gateway_rate_limit = 1000

route53_domain_name = "galaxymorph.com"

route53_portal_record_name = "pedidos.galaxymorph.com"
route53_api_record_name    = "api.pedidos.galaxymorph.com"
route53_assets_record_name = "assets.galaxymorph.com"

cloudfront_portal_aliases = ["pedidos.galaxymorph.com"]
cloudfront_api_aliases    = ["api.pedidos.galaxymorph.com"]
cloudfront_assets_aliases = ["assets.galaxymorph.com"]

cognito_callback_urls = ["https://pedidos.galaxymorph.com/callback"]
cognito_logout_urls   = ["https://pedidos.galaxymorph.com/"]

enable_github_actions_oidc       = true
github_repository                = "jeancdevx/distrinorte"
github_oidc_branches             = ["develop", "production"]
github_oidc_environments         = ["dev"]
github_actions_attach_power_user = true

tags = {
  ManagedBy = "terraform"
  Project   = "distrinorte"
  Team      = "distrinorte-iac"
}
