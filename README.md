# 北京榫合云科技有限公司门户网站

这是一个轻量门户站首版，目标是形成完整获客闭环：

1. 客户进入门户，了解公司定位、服务范围、交付流程和适用场景。
2. 客户填写项目需求表单。
3. 服务端校验并保存线索到 `data/leads.jsonl`。
4. 后台页面读取线索，支持导出 CSV。
5. 后续可接入企业微信、钉钉、邮件、数据库或 CRM。

## 技术栈

- 前端：原生 HTML / CSS / JavaScript
- 服务端：Node.js 内置 HTTP 模块
- 数据存储：本地 JSONL 文件
- 部署：阿里云 ECS + Node.js + Nginx 反向代理

首版没有引入第三方依赖，适合快速上线、低成本维护。

## 本地运行

```bash
cd /Users/edy/ideaProjects/sunyun-portal
npm run dev
```

访问：

- 门户首页：`http://localhost:4173`
- 线索后台：`http://localhost:4173/admin.html`
- 健康检查：`http://localhost:4173/api/health`

默认后台口令：

```text
dev-local-token
```

生产环境必须设置自己的口令：

```bash
SUNYUN_ADMIN_TOKEN='替换成强口令' PORT=8080 npm start
```

## 打包

```bash
cd /Users/edy/ideaProjects/sunyun-portal
bash scripts/package.sh
```

产物输出到：

```text
dist/sunyun-portal-<version>.tar.gz
```

打包内容包含：

- `server.js`
- `package.json`
- `public/`
- `deploy/`
- `.env.example`
- 空的 `data/` 目录

## 线索数据

表单提交后写入：

```text
/Users/edy/ideaProjects/sunyun-portal/data/leads.jsonl
```

每行是一条 JSON，便于后续导入 MySQL、PostgreSQL、飞书多维表格或 CRM。

## ECS 部署建议

更完整的部署流程见：

```text
deploy/README_DEPLOY.md
```

推荐两种方式：

1. `tar.gz + systemd + Nginx`：适合普通 ECS，稳定、低资源。
2. `Docker Compose`：适合后续继续接 MySQL、统计服务、通知服务。

### 直接 Node 启动

```bash
SUNYUN_ADMIN_TOKEN='替换成强口令' PORT=8080 npm start
```

### Docker Compose 启动

```bash
SUNYUN_ADMIN_TOKEN='替换成强口令' SUNYUN_PORT=8080 docker compose up -d --build
```

### Nginx 反向代理示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 上线前需要替换

- `public/app.js` 中的 `contactEmail`
- 首页底部或联系区域中的真实电话、邮箱、微信
- 域名、备案号、公司 Logo、案例图片
- 后台口令 `SUNYUN_ADMIN_TOKEN`

## 后续增强方向

- 表单提交后推送到企业微信、钉钉或飞书。
- 将 `data/leads.jsonl` 换成 MySQL/PostgreSQL。
- 增加案例详情页、文章栏目、SEO sitemap。
- 增加验证码和更严格的后台认证。
- 增加访问统计，例如 Umami 或百度统计。
