locals {
  name_prefix = "${var.project_name}-${var.environment}"

  # Hosted zone ID constant for CloudFront alias records.
  cloudfront_zone_id = "Z2FDTNDATAQYW2"
}
