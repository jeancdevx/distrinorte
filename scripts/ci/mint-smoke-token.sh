#!/usr/bin/env bash
# Mint a fresh Cognito IdToken for HTTP smoke tests.
# Run from iac/environments/dev after terraform init (uses terraform output).
set -euo pipefail

POOL_ID="$(terraform output -raw cognito_user_pool_id)"
CLIENT_ID="$(terraform output -raw cognito_app_client_id)"
USERNAME="${SMOKE_DEMO_USERNAME:-demo.elnorte@distrinorte.demo}"
PASSWORD="${SMOKE_DEMO_PASSWORD:?Set SMOKE_DEMO_PASSWORD}"

aws cognito-idp admin-initiate-auth \
  --region "${AWS_REGION:-us-east-2}" \
  --user-pool-id "${POOL_ID}" \
  --client-id "${CLIENT_ID}" \
  --auth-flow ADMIN_USER_PASSWORD_AUTH \
  --auth-parameters "USERNAME=${USERNAME},PASSWORD=${PASSWORD}" \
  --query 'AuthenticationResult.IdToken' \
  --output text | tr -d '\n\r'
