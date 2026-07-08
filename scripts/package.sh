#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="sunyun-portal"
VERSION="${1:-$(date +%Y%m%d%H%M%S)}"
DIST_DIR="${ROOT_DIR}/dist"
STAGE_DIR="${DIST_DIR}/${APP_NAME}-${VERSION}"
ARCHIVE="${DIST_DIR}/${APP_NAME}-${VERSION}.tar.gz"

rm -rf "${STAGE_DIR}"
mkdir -p "${STAGE_DIR}/data"

cp "${ROOT_DIR}/package.json" "${STAGE_DIR}/"
cp "${ROOT_DIR}/server.js" "${STAGE_DIR}/"
cp "${ROOT_DIR}/README.md" "${STAGE_DIR}/"
cp "${ROOT_DIR}/.env.example" "${STAGE_DIR}/"
cp -R "${ROOT_DIR}/public" "${STAGE_DIR}/public"
cp -R "${ROOT_DIR}/deploy" "${STAGE_DIR}/deploy"
touch "${STAGE_DIR}/data/.gitkeep"

tar -C "${DIST_DIR}" -czf "${ARCHIVE}" "${APP_NAME}-${VERSION}"

echo "${ARCHIVE}"
