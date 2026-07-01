#!/usr/bin/env bash
set -euo pipefail

CLUSTER="${ECS_CLUSTER:-distrinorte-dev-cluster}"
PREFIX="${ECS_NAME_PREFIX:-distrinorte-dev}"

deploy_if_changed() {
  local service="$1"
  local changed_var="CHANGED_${service//-/_}"

  if [ "${!changed_var:-false}" != "true" ]; then
    echo "Skip ECS deploy ${service} (unchanged)"
    return
  fi

  local ecs_service="${PREFIX}-${service}"
  echo "Rolling deploy ${ecs_service}"

  aws ecs update-service \
    --cluster "${CLUSTER}" \
    --service "${ecs_service}" \
    --force-new-deployment \
    --no-cli-pager

  aws ecs wait services-stable \
    --cluster "${CLUSTER}" \
    --services "${ecs_service}"
}

for service in customers-service inventory-service orders-service catalog-service; do
  deploy_if_changed "${service}"
done
