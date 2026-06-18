resource "aws_s3_bucket" "portal_spa" {
  bucket        = local.portal_spa_bucket_name
  force_destroy = var.force_destroy

  tags = merge(var.tags, {
    Name    = local.portal_spa_bucket_name
    Purpose = "portal-spa"
  })
}

resource "aws_s3_bucket_versioning" "portal_spa" {
  bucket = aws_s3_bucket.portal_spa.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "portal_spa" {
  bucket = aws_s3_bucket.portal_spa.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "portal_spa" {
  bucket = aws_s3_bucket.portal_spa.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "portal_spa" {
  bucket = aws_s3_bucket.portal_spa.id

  rule {
    id     = "abort-incomplete-multipart"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
