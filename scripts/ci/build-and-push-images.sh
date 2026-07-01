#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

ECR_REGISTRY="${ECR_REGISTRY:?Set ECR_REGISTRY}"
IMAGE_TAG="${IMAGE_TAG:?Set IMAGE_TAG}"
REPOSITORY_PREFIX="${ECR_REPOSITORY_PREFIX:-distrinorte-dev}"

build_service() {
  local service="$1"
  local image="${ECR_REGISTRY}/${REPOSITORY_PREFIX}-${service}:${IMAGE_TAG}"

  docker build \
    -f docker/Dockerfile.service \
    --build-arg "SERVICE=${service}" \
    -t "${image}" \
    .

  docker push "${image}"
  docker tag "${image}" "${ECR_REGISTRY}/${REPOSITORY_PREFIX}-${service}:latest"
  docker push "${ECR_REGISTRY}/${REPOSITORY_PREFIX}-${service}:latest"
  echo "Pushed ${image}"
}

build_seed() {
  local image="${ECR_REGISTRY}/${REPOSITORY_PREFIX}-seed-runner:${IMAGE_TAG}"

  docker build -f docker/Dockerfile.seed -t "${image}" .
  docker push "${image}"
  docker tag "${image}" "${ECR_REGISTRY}/${REPOSITORY_PREFIX}-seed-runner:latest"
  docker push "${ECR_REGISTRY}/${REPOSITORY_PREFIX}-seed-runner:latest"
  echo "Pushed ${image}"
}

for service in customers-service inventory-service orders-service catalog-service; do
  changed_var="CHANGED_${service//-/_}"
  if [ "${!changed_var:-false}" = "true" ]; then
    build_service "${service}"
  else
    echo "Skip build ${service} (unchanged)"
  fi
done

if [ "${CHANGED_seed_runner:-false}" = "true" ]; then
  build_seed
else
  echo "Skip build seed-runner (unchanged)"
fi
