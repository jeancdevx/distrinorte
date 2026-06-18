locals {
  name_prefix = "${var.project_name}-${var.environment}"

  api_gateway_domain = "${var.api_gateway_rest_api_id}.execute-api.${var.aws_region}.amazonaws.com"
  api_origin_path    = "/${var.api_gateway_stage_name}"

  portal_s3_domain = "${var.portal_spa_bucket_name}.s3.${var.aws_region}.amazonaws.com"
  assets_s3_domain = "${var.catalog_images_bucket_name}.s3.${var.aws_region}.amazonaws.com"

  use_custom_certificate = var.acm_certificate_arn != null

  cache_policy_caching_disabled  = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  cache_policy_caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  origin_request_all_viewer      = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
}
