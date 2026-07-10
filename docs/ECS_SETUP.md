# 阿里云 ECS 第一阶段升级部署

本手册适用于仓库的 Next.js + HeroUI v3 + SQLite 版本。代码由 GitHub 自托管 Runner 自动部署，但服务器环境变量、安全组、Nginx 与数据目录需人工准备一次。

## 1. 合并前备份现有数据

在 ECS 上查找旧线索文件：

```bash
sudo find /opt /home -path '*/sunyun-portal/data/leads.jsonl' -type f 2>/dev/null
```

建立固定数据目录：

```bash
sudo mkdir -p /opt/sunyun-portal/data /opt/sunyun-portal/backups
sudo chown -R deployer:deployer /opt/sunyun-portal
```

如果找到了旧文件，复制进去：

```bash
cp /实际路径/data/leads.jsonl /opt/sunyun-portal/data/leads.jsonl
cp /opt/sunyun-portal/data/leads.jsonl "/opt/sunyun-portal/backups/leads.jsonl.$(date +%Y%m%d-%H%M%S).bak"
```

## 2. 生成后台密码哈希

在本地拉取新分支并安装依赖后执行：

```bash
npm run auth:hash -- '你的至少12位强密码'
```

输出形式：

```text
scrypt:盐值:哈希值
```

不要把原始密码提交到 GitHub。

## 3. 配置 `/opt/sunyun-portal/.env`

```bash
cat > /opt/sunyun-portal/.env <<'EOF_ENV'
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=scrypt:替换为生成值
SESSION_SECRET=替换为openssl生成的随机值
SESSION_TTL_SECONDS=28800
COOKIE_SECURE=1
SUNYUN_PORT=8080
SUNYUN_DATA_DIR=/opt/sunyun-portal/data
EOF_ENV

chmod 600 /opt/sunyun-portal/.env
```

生成 Session 密钥：

```bash
openssl rand -hex 32
```

若暂时只通过 HTTP/IP 测试，可临时设置 `COOKIE_SECURE=0`；HTTPS 配好后立即改回 `1` 并重新部署。

## 4. Nginx

复制 `deploy/nginx.conf.example` 到站点配置，替换域名：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

阿里云安全组只需要：

- 80：公网
- 443：公网
- 22：仅可信管理 IP

不要对公网开放 8080；Docker Compose 已绑定 `127.0.0.1:8080`。

## 5. 触发部署

合并 PR 到 `main`，或在 GitHub Actions 手动运行 `Deploy to Aliyun ECS`。

查看日志：

```bash
docker compose --env-file /opt/sunyun-portal/.env logs --tail=200 sunyun-portal
```

检查：

```bash
curl -fsS http://127.0.0.1:8080/api/health
```

预期返回 `ok: true`。

## 6. 核对旧数据迁移

首次启动时应用自动读取 `/app/data/leads.jsonl` 并导入 `/app/data/sunyun.db`。查看容器日志：

```bash
docker logs sunyun-portal 2>&1 | grep 'Legacy JSONL migration'
```

登录 `/admin` 核对线索数量。确认无误前不要删除旧 JSONL。

## 7. 回滚

先保留当前数据库备份，然后切回旧提交：

```bash
cd Runner实际工作目录/sunyun-portal
git checkout <旧提交SHA>
docker compose --env-file /opt/sunyun-portal/.env up -d --build
```

SQLite 与旧 JSONL 均在 `/opt/sunyun-portal/data`，不会因代码回滚被删除。
