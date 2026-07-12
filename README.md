# 北京云医荟科技有限公司门户网站

面向药企、医疗机构与医药商业公司的医药产业数字化门户。项目采用 Next.js 模块化单体架构，提供公开品牌页面、商务咨询表单、SQLite 线索管理后台与自托管部署能力。

## 门户定位

- 医药业务系统与协作平台
- 数据平台、专题分析与经营视图
- AI 资料整理、知识检索与工作流辅助
- 系统集成、部署支持与持续迭代

本网站面向机构客户，不提供个人医疗咨询、诊断、治疗或用药建议。

## 功能

- 品牌门户、服务范围、交付流程与项目需求表单
- 服务端静态生成首页，只有表单与后台承担客户端交互
- 表单校验、蜜罐字段、请求体限制、应用层与 Nginx 双层限流
- SQLite 持久化、索引、线索状态流转与审计日志
- 管理员登录、登录限流、线索搜索筛选、状态更新与 CSV 导出
- 旧版 `data/leads.jsonl` 首次启动自动迁移，重复启动不会重复导入
- `robots.txt`、`sitemap.xml`、安全响应头与基础 SEO
- 健康检查、SQLite 在线备份、CI、standalone 冒烟测试与 ECS 自动回滚

## 本地运行

```bash
cp .env.example .env.local
npm install
npm run auth:hash -- '你的至少12位强密码'
# 将输出写入 .env.local 的 ADMIN_PASSWORD_HASH
# 本地 HTTP 开发设置 COOKIE_SECURE=0
npm run dev
```

访问：

- 门户：`http://localhost:4173`
- 后台：`http://localhost:4173/admin`
- 健康检查：`http://localhost:4173/api/health`

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

GitHub CI 还会启动 `.next/standalone/server.js`，创建临时 SQLite，并访问 `/api/health`，确认原生 SQLite 模块已经进入生产产物。

## 数据

默认数据库：`data/sunyun.db`。

首次打开数据库时，如果发现 `data/leads.jsonl` 且尚未迁移，会在事务中自动导入旧线索并写入迁移标记。旧 JSONL 不会删除，可作为回滚备份。

手动执行迁移核对：

```bash
npm run db:migrate
```

SQLite 在线备份：

```bash
BACKUP_DIR=/path/to/backups npm run db:backup
```

## Docker

```bash
cp .env.example .env
# 填写真实域名、管理员哈希和随机 SESSION_SECRET
# 将 SUNYUN_RUN_UID / SUNYUN_RUN_GID 改为当前宿主机用户的 id -u / id -g
mkdir -p data
chown "$(id -u):$(id -g)" data
docker compose --env-file .env up -d --build
```

容器以 `SUNYUN_RUN_UID:SUNYUN_RUN_GID` 身份运行，数据目录与宿主机部署用户保持一致，不需要在自动部署中执行 sudo。容器端口仅绑定宿主机 `127.0.0.1`，公网由 Nginx 代理。

生产数据目录通过 `SUNYUN_DATA_DIR` 指向 `/opt/sunyun-portal/data`，不再跟随 GitHub Runner 工作区，避免 checkout 清理未跟踪数据。

## 阿里云 ECS

完整步骤见 `docs/ECS_SETUP.md`。合并到 `main` 后：

1. GitHub CI 完成依赖安装、类型检查、单元/集成测试、生产构建和 standalone 冒烟测试；
2. 只有 CI 成功才触发 ECS 自托管 Runner；
3. Runner 抢救旧 JSONL、备份 SQLite/WAL、保留旧镜像；
4. 新容器通过 `/api/health` 后部署完成；
5. 健康检查失败会自动恢复 `sunyun-portal:rollback`。

## 生产环境必填

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=scrypt:...
SESSION_SECRET=至少32位随机字符串
COOKIE_SECURE=1
SUNYUN_PORT=8080
SUNYUN_DATA_DIR=/opt/sunyun-portal/data
SUNYUN_RUN_UID=deployer用户的UID
SUNYUN_RUN_GID=deployer用户的GID
```

生成密钥：

```bash
openssl rand -hex 32
```
