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
  local task_def_arn

  task_def_arn="$(aws ecs describe-task-definition \
    --task-definition "${ecs_service}" \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)"

  echo "Rolling deploy ${ecs_service} with ${task_def_arn}"

  aws ecs update-service \
    --cluster "${CLUSTER}" \
    --service "${ecs_service}" \
    --task-definition "${task_def_arn}" \
    --force-new-deployment \
    --no-cli-pager

  aws ecs wait services-stable \
    --cluster "${CLUSTER}" \
    --services "${ecs_service}"
}

for service in customers-service inventory-service orders-service catalog-service; do
  deploy_if_changed "${service}"
done
