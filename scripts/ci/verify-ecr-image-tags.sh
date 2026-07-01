#!/usr/bin/env bash
# Verifica que cada tag resuelto exista en ECR (ejecutar después de build/push).
set -euo pipefail

TAGS_JSON="${1:?Usage: verify-ecr-image-tags.sh '<json>'}"

PREFIX="${ECR_REPOSITORY_PREFIX:-distrinorte-dev}"

for service in customers-service inventory-service orders-service catalog-service seed-runner; do
  tag="$(echo "${TAGS_JSON}" | jq -r --arg s "${service}" '.[$s]')"

  if [ -z "${tag}" ] || [ "${tag}" = "null" ]; then
    echo "ERROR: missing tag for ${service} in ${TAGS_JSON}" >&2
    exit 1
  fi

  aws ecr describe-images \
    --repository-name "${PREFIX}-${service}" \
    --image-ids "imageTag=${tag}" \
    --query 'imageDetails[0].imageDigest' \
    --output text >/dev/null

  echo "ECR ok: ${PREFIX}-${service}:${tag}"
done
