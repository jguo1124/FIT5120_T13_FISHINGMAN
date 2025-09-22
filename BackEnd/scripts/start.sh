#!/usr/bin/env bash
set -euo pipefail

# Bash launcher: validates required env and runs the backend.
# Usage:
#   OPENWEATHER_API_KEY=xxxx ADMIN_PASSWORD=supersecret AUTH_TOKEN_SECRET=... backend/scripts/start.sh

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

API_KEY="${OPENWEATHER_API_KEY:-${OW_API_KEY:-${OPENWEATHER_KEY:-}}}"
if [[ -z "${API_KEY}" ]]; then
  echo "[error] OPENWEATHER_API_KEY is not set (or OW_API_KEY / OPENWEATHER_KEY)." >&2
  echo "        Please export it before running this script." >&2
  exit 1
fi

ADMIN_PASSWORD="${ADMIN_PASSWORD:-}" 
if [[ -z "${ADMIN_PASSWORD}" ]]; then
  echo "[error] ADMIN_PASSWORD is required for admin login." >&2
  exit 1
fi

export OPENWEATHER_API_KEY="${API_KEY}"
export ADMIN_PASSWORD
export NODE_ENV="${NODE_ENV:-development}"

if [[ -z "${AUTH_TOKEN_SECRET:-}" ]]; then
  echo "[warn] AUTH_TOKEN_SECRET is not set; tokens will reset whenever the server restarts." >&2
else
  export AUTH_TOKEN_SECRET
fi

echo "[env] OPENWEATHER_API_KEY: present"
echo "[env] ADMIN_PASSWORD: present"
echo "[env] AUTH_TOKEN_SECRET: ${AUTH_TOKEN_SECRET:+present}" 
echo "[env] NODE_ENV: ${NODE_ENV}"
echo "[run] node src/app.js (cwd=${BACKEND_DIR})"

cd "${BACKEND_DIR}"
exec node src/app.js
