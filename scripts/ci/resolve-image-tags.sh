#!/usr/bin/env bash
# Resuelve tags ECR por servicio: SHA si cambió, tag actual en ECS/ECR si no.
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
REPOSITORY_PREFIX="${ECR_REPOSITORY_PREFIX:-distrinorte-dev}"
SERVICES=(
  customers-service
  inventory-service
  orders-service
  catalog-service
  seed-runner
)

ecr_repository() {
  local service="$1"
  echo "${REPOSITORY_PREFIX}-${service}"
}

tag_exists_in_ecr() {
  local service="$1"
  local tag="$2"

  [ -n "${tag}" ] || return 1
  [ "${tag}" != "None" ] || return 1

  aws ecr describe-images \
    --repository-name "$(ecr_repository "${service}")" \
    --image-ids "imageTag=${tag}" \
    --query 'imageDetails[0].imageTags' \
    --output text >/dev/null 2>&1
}

# Prefer immutable git SHA tags; never rely on :latest for ECS task definitions.
resolve_ecr_tag() {
  local service="$1"
  local repo
  repo="$(ecr_repository "${service}")"

  if ! aws ecr describe-repositories --repository-names "${repo}" >/dev/null 2>&1; then
    echo "ERROR: ECR repository ${repo} not found" >&2
    exit 1
  fi

  local tag
  tag="$(
    aws ecr describe-images \
      --repository-name "${repo}" \
      --query 'reverse(sort_by(imageDetails,&imagePushedAt))[].imageTags[]' \
      --output text 2>/dev/null \
      | tr '\t' '\n' \
      | grep -Ev '^latest$' \
      | head -n1 \
      || true
  )"

  if [ -n "${tag}" ]; then
    echo "${tag}"
    return
  fi

  tag="$(
    aws ecr describe-images \
      --repository-name "${repo}" \
      --query 'reverse(sort_by(imageDetails,&imagePushedAt))[0].imageTags[0]' \
      --output text 2>/dev/null \
      || true
  )"

  if [ -n "${tag}" ] && [ "${tag}" != "None" ]; then
    echo "${tag}"
    return
  fi

  echo "ERROR: No images in ECR repository ${repo}" >&2
  exit 1
}

resolve_running_tag() {
  local service="$1"
  local ecs_service="${PREFIX}-${service}"
  local task_def image tag

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
    resolve_ecr_tag "${service}"
    return
  fi

  image="$(aws ecs describe-task-definition \
    --task-definition "${task_def}" \
    --query "taskDefinition.containerDefinitions[?name=='${service}'].image | [0]" \
    --output text)"

  if [ -z "${image}" ] || [ "${image}" = "None" ]; then
    resolve_ecr_tag "${service}"
    return
  fi

  tag="${image##*:}"

  if [ "${tag}" = "latest" ] || ! tag_exists_in_ecr "${service}" "${tag}"; then
    resolve_ecr_tag "${service}"
    return
  fi

  echo "${tag}"
}

json="{"
first=true
for service in "${SERVICES[@]}"; do
  if [ "${CHANGED[$service]:-false}" = "true" ]; then
    tag="${NEW_TAG}"
  else
    tag="$(resolve_running_tag "${service}")"
    if ! tag_exists_in_ecr "${service}" "${tag}"; then
      echo "ERROR: image tag ${tag} not found in $(ecr_repository "${service}")" >&2
      exit 1
    fi
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
