# 手机 Codex 任务提示词（sunyun-portal 专用）

> 复制下面整段，粘贴到手机端 Codex（ChatGPT / Codex web，已连接本 GitHub 仓库）即可。
> 把 `{{具体任务}}` 换成你这次想让 Codex 做的具体改动。

---

你正在维护 GitHub 仓库 `sunyun-portal`（北京榫合云科技有限公司门户网站）。

## 项目现状（不要推翻，沿用）
- 纯静态前端（`public/index.html` + `styles.css` + `app.js`）+ Node.js 内置 HTTP 服务端（`server.js`），**零第三方运行时依赖**。
- 核心闭环：门户需求表单 → `POST /api/leads` 追加写入 `data/leads.jsonl` → 后台 `admin.html` 查看并导出 CSV。
- 已具备 Docker 部署：`Dockerfile`（node:20-alpine）、`docker-compose.yml`、`.github/workflows/deploy.yml`（push 到 main 后由 ECS 自托管 Runner 自动部署）。
- 设计风格：极简信任风，墨黑 + 冷灰 + 单一强调色 `#0e7d6b`，字体 Space Grotesk + Noto Sans SC。
- 表单字段名（勿改，前端 `app.js` 依赖）：`serviceType / city / companyName / contactName / phone / wechat / eventDate / attendees / budget / description / consent`；钩子：`#leadForm`、`#formResult`、`.submit-button`。

## 本次任务
{{具体任务，例如：
- 在 footer 填入真实联系方式与备案号，并加 HTTPS 说明；
- 给 admin 后台加登录会话（token 存入 httpOnly cookie）与 CSRF 防护；
- 新增「公司资质 / 经营范围」栏目，内容依据公司章程一般项目列表；
- 优化移动端首页某区块的响应式表现。}}

## 硬性约束（必须遵守）
1. **不要把密码、密钥、数据库连接写死在代码里**；部署凭据一律走环境变量（`SUNYUN_ADMIN_TOKEN` 等），本地用 `.env.example` 举例、不要把真实值提交。
2. 保持零第三方依赖；`npm install` 不应引入新运行时包（构建/部署脚本除外）。
3. 不要改动 `docker-compose.yml` 的服务名 `sunyun-portal` 与容器端口 `8080`，否则自动部署会断。
4. 改动需保持 WCAG AA 对比度、`:focus-visible` 可见焦点、`prefers-reduced-motion` 兼容。

## 交付要求
1. 完成后在当前仓库创建 PR（目标分支 `main`），PR 描述写清：改了什么、如何本地验证（`npm run dev` 后访问 `http://localhost:4173`）、如何部署（合并即自动部署到 ECS，无需手动操作）、如何访问（公网域名/IP）。

完成后，用一句话告诉我 PR 已创建以及它的链接。
