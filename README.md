# 北京榫合云科技有限公司门户网站

面向官网获客与早期线索管理的模块化单体应用。第一阶段已由原生 HTML + 单文件 Node 服务升级为：

- Next.js 16 App Router + React 19 + TypeScript
- HeroUI v3 + Tailwind CSS v4
- SQLite（`better-sqlite3`）
- HttpOnly Cookie 管理员会话
- Docker Compose + Nginx + 阿里云 ECS 自托管 Runner

## 功能

- 品牌门户、服务范围、交付流程与项目需求表单
- 表单校验、蜜罐字段、应用层与 Nginx 双层限流
- SQLite 持久化、索引、线索状态流转与审计日志
- 管理员登录、线索搜索筛选、状态更新与 CSV 导出
- 旧版 `data/leads.jsonl` 首次启动自动迁移，重复启动不会重复导入
- 健康检查、数据库备份脚本、CI 构建测试与 ECS 自动部署

## 本地运行

```bash
cp .env.example .env.local
npm install
npm run auth:hash -- '你的至少12位强密码'
# 将输出写入 .env.local 的 ADMIN_PASSWORD_HASH
npm run dev
```

访问：

- 门户：`http://localhost:4173`
- 后台：`http://localhost:4173/admin`
- 健康检查：`http://localhost:4173/api/health`

本地 HTTP 开发时设置：

```env
COOKIE_SECURE=0
```

生产 HTTPS 必须使用：

```env
COOKIE_SECURE=1
```

## 检查

```bash
npm run typecheck
npm test
npm run build
```

## 数据

默认数据库：`data/sunyun.db`。

首次打开数据库时，如果发现 `data/leads.jsonl` 且尚未迁移，会在事务中自动导入旧线索并写入迁移标记。旧 JSONL 不会删除，可作为回滚备份。

手动执行迁移核对：

```bash
npm run db:migrate
```

手动备份：

```bash
BACKUP_DIR=/path/to/backups npm run db:backup
```

## Docker

```bash
cp .env.example .env
# 填写真实域名、管理员哈希和随机 SESSION_SECRET
docker compose --env-file .env up -d --build
```

容器端口仅绑定宿主机 `127.0.0.1`，公网由 Nginx 代理。生产数据目录通过 `SUNYUN_DATA_DIR` 指向 `/opt/sunyun-portal/data`，不再跟随 GitHub Runner 工作区，避免 checkout 清理未跟踪数据。

## 阿里云 ECS

完整步骤见 `docs/ECS_SETUP.md`。合并到 `main` 后，自托管 Runner 会：

1. 抢救旧工作区中的 `leads.jsonl`；
2. 备份现有 SQLite；
3. 构建镜像；
4. 启动新容器；
5. 通过 `/api/health` 验证。

## 生产环境必填

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=scrypt:...
SESSION_SECRET=至少32位随机字符串
COOKIE_SECURE=1
SUNYUN_PORT=8080
SUNYUN_DATA_DIR=/opt/sunyun-portal/data
```

生成密钥：

```bash
openssl rand -hex 32
```
