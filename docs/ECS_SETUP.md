# 阿里云 ECS 第一阶段升级部署

本手册适用于仓库的 Next.js + HeroUI v3 + SQLite 版本。代码由 GitHub 自托管 Runner 自动部署，但服务器环境变量、安全组、Nginx 与数据目录需人工准备一次。

## 1. 合并前备份现有数据

在 ECS 上查找旧线索文件：

```bash
sudo find /opt /home -path '*/sunyun-portal/data/leads.jsonl' -type f 2>/dev/null
```

建立固定数据和备份目录，并一次性授权给自托管 Runner 使用的 `deployer` 用户：

```bash
sudo mkdir -p /opt/sunyun-portal/data /opt/sunyun-portal/backups
sudo chown -R deployer:deployer /opt/sunyun-portal
```

如果找到了旧文件，先复制和备份：

```bash
sudo cp /实际路径/data/leads.jsonl /opt/sunyun-portal/data/leads.jsonl
sudo cp /opt/sunyun-portal/data/leads.jsonl "/opt/sunyun-portal/backups/leads.jsonl.$(date +%Y%m%d-%H%M%S).bak"
sudo chown -R deployer:deployer /opt/sunyun-portal
```

自动部署工作流不会使用 `sudo`。Docker Compose 会让容器进程使用 Runner 当前用户的 UID/GID，因此 SQLite 与备份文件始终由 `deployer` 管理。

查看实际 UID/GID：

```bash
id -u deployer
id -g deployer
```

## 2. 生成后台密码哈希

在本地拉取新分支并安装依赖后执行：

```bash
npm install
npm run auth:hash -- '你的至少12位强密码'
```

输出形式：

```text
scrypt:盐值:哈希值
```

不要把原始密码或哈希提交到 GitHub；哈希只写入 ECS 的 `/opt/sunyun-portal/.env`。

## 3. 配置 `/opt/sunyun-portal/.env`

先执行下面两条命令，记下结果：

```bash
id -u deployer
id -g deployer
```

再创建环境文件：

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
SUNYUN_RUN_UID=替换为id -u deployer的结果
SUNYUN_RUN_GID=替换为id -g deployer的结果
# 首次升级期间建议保留旧值，便于自动回滚到旧镜像后继续访问旧后台。
SUNYUN_ADMIN_TOKEN=替换为现有旧后台口令
EOF_ENV

chmod 600 /opt/sunyun-portal/.env
```

生成 Session 密钥：

```bash
openssl rand -hex 32
```

注意：新版 `SUNYUN_PORT` 只能填写端口数字，例如 `8080`，不要继续填写旧格式 `127.0.0.1:8080`；Compose 已自动绑定到本机回环地址。

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

合并 PR 到 `main` 后，GitHub 会先运行 CI；只有依赖安装、类型检查、测试、生产构建和 SQLite standalone 冒烟测试全部通过，才会触发 ECS 自动部署。也可以在 GitHub Actions 手动运行 `Deploy to Aliyun ECS`。

工作流会依次：

1. 抢救 Runner 旧工作区中的 `leads.jsonl`；
2. 备份 SQLite、WAL 和旧 JSONL；
3. 保存当前镜像为 `sunyun-portal:rollback`；
4. 构建并启动新镜像；
5. 访问 `/api/health`，确认 SQLite 可写、服务可用；
6. 健康检查失败时自动恢复旧镜像。

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

检查宿主机数据文件：

```bash
ls -lah /opt/sunyun-portal/data
```

## 7. 手动回滚

部署工作流会自动回滚。需要人工恢复上一镜像时，在 Runner 当前项目目录执行：

```bash
export SUNYUN_RUN_UID="$(id -u)"
export SUNYUN_RUN_GID="$(id -g)"
docker tag sunyun-portal:rollback sunyun-portal:latest
docker compose --env-file /opt/sunyun-portal/.env up -d --force-recreate --no-build sunyun-portal
curl -fsS http://127.0.0.1:8080/api/health
```

SQLite 与旧 JSONL 均在 `/opt/sunyun-portal/data`，不会因镜像回滚或 Actions checkout 被删除。
