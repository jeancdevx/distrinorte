#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

IMAGE_TAG="${1:-local}"
REGISTRY="${ECR_REGISTRY:?Set ECR_REGISTRY}"
REPOSITORY_PREFIX="${ECR_REPOSITORY_PREFIX:-distrinorte-dev}"

IMAGE="${REGISTRY}/${REPOSITORY_PREFIX}-seed-runner:${IMAGE_TAG}"

docker build \
  -f docker/Dockerfile.seed \
  -t "${IMAGE}" \
  .

echo "Built ${IMAGE}"
