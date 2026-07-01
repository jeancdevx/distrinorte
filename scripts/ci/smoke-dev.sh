#!/usr/bin/env bash
set -euo pipefail

CLUSTER="${ECS_CLUSTER:-distrinorte-dev-cluster}"
PREFIX="${ECS_NAME_PREFIX:-distrinorte-dev}"
SMOKE_BASE_URL="${SMOKE_BASE_URL:-}"

check_ecs_service() {
  local service="$1"
  local ecs_service="${PREFIX}-${service}"
  local running desired

  read -r running desired <<<"$(aws ecs describe-services \
    --cluster "${CLUSTER}" \
    --services "${ecs_service}" \
    --query 'services[0].[runningCount,desiredCount]' \
    --output text)"

  if [ "${running}" != "${desired}" ] || [ "${desired}" = "0" ]; then
    echo "ECS smoke failed: ${ecs_service} running=${running} desired=${desired}"
    return 1
  fi

  echo "ECS smoke ok: ${ecs_service} (${running}/${desired} tasks)"
}

for service in customers-service inventory-service orders-service catalog-service; do
  check_ecs_service "${service}"
done

if [ -n "${SMOKE_BASE_URL}" ] && [ -n "${SMOKE_ACCESS_TOKEN:-}" ]; then
  echo "HTTP smoke against ${SMOKE_BASE_URL}"
  for path in orders/health catalog/health inventory/health customers/health; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' \
      -H "Authorization: Bearer ${SMOKE_ACCESS_TOKEN}" \
      "${SMOKE_BASE_URL}/${path}")"
    if [ "${code}" -lt 200 ] || [ "${code}" -ge 300 ]; then
      echo "HTTP smoke failed: GET /${path} -> ${code}"
      exit 1
    fi
    echo "HTTP smoke ok: GET /${path} -> ${code}"
  done
else
  echo "Skip HTTP smoke (set SMOKE_BASE_URL + SMOKE_ACCESS_TOKEN to enable)"
fi
