#!/usr/bin/env bash
set -euo pipefail

TASK_ARN="${1:?Usage: wait-for-ecs-task.sh <task-arn> [cluster-name]}"
CLUSTER_NAME="${2:-}"
REGION="${AWS_REGION:-us-east-2}"
TIMEOUT_SECONDS="${ECS_TASK_WAIT_TIMEOUT:-900}"
POLL_SECONDS="${ECS_TASK_WAIT_POLL:-10}"

deadline=$((SECONDS + TIMEOUT_SECONDS))

describe() {
  if [[ -n "${CLUSTER_NAME}" ]]; then
    aws ecs describe-tasks \
      --region "${REGION}" \
      --cluster "${CLUSTER_NAME}" \
      --tasks "${TASK_ARN}"
  else
    aws ecs describe-tasks \
      --region "${REGION}" \
      --tasks "${TASK_ARN}"
  fi
}

while (( SECONDS < deadline )); do
  STATUS=$(describe | jq -r '.tasks[0].lastStatus // "UNKNOWN"')
  STOP_REASON=$(describe | jq -r '.tasks[0].stoppedReason // ""')
  EXIT_CODE=$(describe | jq -r '.tasks[0].containers[0].exitCode // empty')

  echo "ECS task ${TASK_ARN}: status=${STATUS}"

  if [[ "${STATUS}" == "STOPPED" ]]; then
    if [[ "${EXIT_CODE}" == "0" ]]; then
      echo "ECS task completed successfully"
      exit 0
    fi

    echo "ECS task failed (exitCode=${EXIT_CODE:-n/a}, reason=${STOP_REASON})" >&2
    exit 1
  fi

  sleep "${POLL_SECONDS}"
done

echo "Timed out waiting for ECS task ${TASK_ARN}" >&2
exit 1
