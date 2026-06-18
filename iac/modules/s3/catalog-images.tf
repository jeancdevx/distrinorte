resource "aws_s3_bucket" "catalog_images" {
  bucket        = local.catalog_images_bucket_name
  force_destroy = var.force_destroy

  tags = merge(var.tags, {
    Name    = local.catalog_images_bucket_name
    Purpose = "catalog-images"
  })
}

resource "aws_s3_bucket_versioning" "catalog_images" {
  bucket = aws_s3_bucket.catalog_images.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "catalog_images" {
  bucket = aws_s3_bucket.catalog_images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "catalog_images" {
  bucket = aws_s3_bucket.catalog_images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "catalog_images" {
  bucket = aws_s3_bucket.catalog_images.id

  rule {
    id     = "abort-incomplete-multipart"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
