# 第一阶段架构

```text
Internet
   |
Nginx: TLS / 限流 / 反向代理
   |
Next.js 模块化单体
   |-- Marketing UI: React 19 + HeroUI v3
   |-- Route Handlers: leads / auth / health
   |-- Domain modules: validation / auth / security / repository
   |
SQLite: leads / audit_logs / app_meta
   |
/opt/sunyun-portal/data 持久化与备份
```

设计原则：

1. 当前规模不引入微服务，保持单容器部署。
2. 页面、接口、认证、数据库访问分模块，避免回到单文件后端。
3. SQLite 适合单机门户和早期 CRM；需要多实例时再迁移 PostgreSQL。
4. 管理员会话只放 HttpOnly Cookie，不在 localStorage 保存长期凭据。
5. Nginx 与应用同时限制提交频率；8080 不暴露公网。
6. 数据目录与 GitHub Runner 工作区解耦。
