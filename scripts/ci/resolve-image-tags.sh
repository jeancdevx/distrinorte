#!/usr/bin/env bash
# Resuelve tags ECR por servicio: SHA si cambió, tag actual en ECS si no.
set -euo pipefail

NEW_TAG="${1:?Usage: resolve-image-tags.sh <new-tag> <customers:true|false> ...>}"
shift

declare -A CHANGED=()
for entry in "$@"; do
  service="${entry%%:*}"
  flag="${entry##*:}"
  CHANGED["$service"]="$flag"
done

CLUSTER="${ECS_CLUSTER:-distrinorte-dev-cluster}"
PREFIX="${ECS_NAME_PREFIX:-distrinorte-dev}"
SERVICES=(
  customers-service
  inventory-service
  orders-service
  catalog-service
  seed-runner
)

resolve_running_tag() {
  local service="$1"
  local ecs_service="${PREFIX}-${service}"
  local task_def image

  if [ "${service}" = "seed-runner" ]; then
    task_def="$(aws ecs describe-task-definition \
      --task-definition "${ecs_service}" \
      --query 'taskDefinition.taskDefinitionArn' \
      --output text 2>/dev/null || true)"
  else
    task_def="$(aws ecs describe-services \
      --cluster "${CLUSTER}" \
      --services "${ecs_service}" \
      --query 'services[0].taskDefinition' \
      --output text 2>/dev/null || true)"
  fi

  if [ -z "${task_def}" ] || [ "${task_def}" = "None" ]; then
    echo "latest"
    return
  fi

  image="$(aws ecs describe-task-definition \
    --task-definition "${task_def}" \
    --query "taskDefinition.containerDefinitions[?name=='${service}'].image | [0]" \
    --output text)"

  if [ -z "${image}" ] || [ "${image}" = "None" ]; then
    echo "latest"
    return
  fi

  echo "${image##*:}"
}

json="{"
first=true
for service in "${SERVICES[@]}"; do
  if [ "${CHANGED[$service]:-false}" = "true" ]; then
    tag="${NEW_TAG}"
  else
    tag="$(resolve_running_tag "${service}")"
  fi

  if [ "${first}" = true ]; then
    first=false
  else
    json+=","
  fi
  json+="\"${service}\":\"${tag}\""
done
json+="}"

echo "${json}"
