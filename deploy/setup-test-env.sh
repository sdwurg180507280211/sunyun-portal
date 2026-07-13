#!/usr/bin/env bash
#
# sunyun-portal 测试环境初始化脚本
# 用途：在 ECS（self-hosted runner 所在机器）上执行一次，建立测试环境目录与独立 .env。
#       之后推送 develop 分支即可由 GitHub Actions 自动部署到 127.0.0.1:8081。
# 前置：需 openssl 与 node（生成 SESSION_SECRET 与 scrypt 密码哈希）。
#       若 node 不在 PATH，可改用生产目录的 tsx：
#         cd /opt/sunyun-portal && npx tsx scripts/hash-admin-password.ts '你的测试密码'
#
set -euo pipefail

TEST_DIR=/opt/sunyun-portal-test
ENV_FILE="$TEST_DIR/.env"

echo "==> 创建测试环境目录 $TEST_DIR"
mkdir -p "$TEST_DIR/data" "$TEST_DIR/backups"
chown -R "$(id -u):$(id -g)" "$TEST_DIR"

echo "==> 生成独立 SESSION_SECRET"
SESSION_SECRET="$(openssl rand -hex 32)"

echo "==> 设置测试环境管理员密码（至少 12 位，输入不回显）"
read -r -s -p "测试环境管理员密码: " TEST_ADMIN_PASSWORD
echo
if [ "${#TEST_ADMIN_PASSWORD}" -lt 12 ]; then
  echo "错误：密码至少 12 位" >&2
  exit 1
fi

echo "==> 生成 scrypt 密码哈希"
ADMIN_PASSWORD_HASH="$(node -e "const c=require('crypto');const p=process.argv[1];const s=c.randomBytes(16).toString('hex');const d=c.scryptSync(p,s,64).toString('hex');console.log('scrypt:'+s+':'+d)" "$TEST_ADMIN_PASSWORD")"

TEST_ADMIN_USERNAME="${TEST_ADMIN_USERNAME:-admin}"

# 可选公网 IP：用于 NEXT_PUBLIC_SITE_URL，便于外网通过 http://<IP>:8081 访问。
ECS_IP="${ECS_IP:-}"
if [ -n "$ECS_IP" ]; then
  SITE_URL="http://${ECS_IP}:8081"
else
  SITE_URL="http://localhost:8081"
fi

echo "==> 写入 $ENV_FILE"
cat > "$ENV_FILE" <<EOF
NODE_ENV=production
PORT=8080
NEXT_PUBLIC_SITE_URL=$SITE_URL
DATABASE_PATH=/app/data/sunyun.db
LEGACY_LEADS_PATH=/app/data/leads.jsonl
ADMIN_USERNAME=$TEST_ADMIN_USERNAME
ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH
SESSION_SECRET=$SESSION_SECRET
SESSION_TTL_SECONDS=28800
COOKIE_SECURE=0
TRUST_PROXY=1
SUNYUN_PORT=8081
SUNYUN_DATA_DIR=$TEST_DIR/data
SUNYUN_RUN_UID=$(id -u)
SUNYUN_RUN_GID=$(id -g)
SUNYUN_ADMIN_TOKEN=
EOF

chmod 600 "$ENV_FILE"
echo "完成。测试环境 .env 已写入 $ENV_FILE"
echo "后续：推送 develop 分支即可自动部署到 http://127.0.0.1:8081"
echo "      如需外网访问，在安全组放行 8081 或用 nginx 反代到该端口。"
