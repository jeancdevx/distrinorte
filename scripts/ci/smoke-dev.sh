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
  SMOKE_ACCESS_TOKEN="$(printf '%s' "${SMOKE_ACCESS_TOKEN}" | tr -d '\n\r')"
  echo "HTTP smoke against ${SMOKE_BASE_URL}"
  for path in orders/health catalog/health inventory/health customers/health; do
    response="$(curl -sS -w $'\n%{http_code}' \
      -H "Authorization: Bearer ${SMOKE_ACCESS_TOKEN}" \
      -H "User-Agent: distrinorte-ci-smoke/1.0" \
      -H "X-Correlation-Id: ci-smoke-${GITHUB_RUN_ID:-local}-${path//\//-}" \
      "${SMOKE_BASE_URL}/${path}")"
    code="$(printf '%s' "${response}" | tail -n1)"
    body="$(printf '%s' "${response}" | sed '$d' | head -c 500)"
    if [ "${code}" -lt 200 ] || [ "${code}" -ge 300 ]; then
      echo "HTTP smoke failed: GET /${path} -> ${code}"
      if [ -n "${body}" ]; then
        echo "Response body (truncated): ${body}"
      fi
      if [ "${code}" = "403" ]; then
        echo "Hint: 403 from the edge often means WAF blocked the request (e.g. GitHub Actions datacenter IP)."
        echo "      Ensure waf_block_anonymous_ips=false is applied in dev, or use SMOKE_DEMO_PASSWORD to mint a fresh token."
      fi
      exit 1
    fi
    echo "HTTP smoke ok: GET /${path} -> ${code}"
  done
else
  echo "Skip HTTP smoke (set SMOKE_BASE_URL + SMOKE_ACCESS_TOKEN to enable)"
fi
