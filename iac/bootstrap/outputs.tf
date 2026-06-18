output "state_bucket_name" {
  description = "Bucket S3 para Terraform state"
  value       = aws_s3_bucket.terraform_state.id
}

output "logging_bucket_name" {
  description = "Bucket S3 para access logs del state"
  value       = aws_s3_bucket.logging.id
}

output "aws_account_id" {
  description = "ID de la cuenta AWS"
  value       = data.aws_caller_identity.current.account_id
}
