#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

SERVICE="${1:?Usage: docker-build-service.sh <service-name> [image-tag]}"
IMAGE_TAG="${2:-local}"
REGISTRY="${ECR_REGISTRY:?Set ECR_REGISTRY (account.dkr.ecr.region.amazonaws.com)}"
REPOSITORY_PREFIX="${ECR_REPOSITORY_PREFIX:-distrinorte-dev}"

IMAGE="${REGISTRY}/${REPOSITORY_PREFIX}-${SERVICE}:${IMAGE_TAG}"

docker build \
  -f docker/Dockerfile.service \
  --build-arg "SERVICE=${SERVICE}" \
  -t "${IMAGE}" \
  .

echo "Built ${IMAGE}"
