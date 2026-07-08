# 部署流程

## 方案 A：tar.gz + systemd + Nginx

本方案适合一台普通阿里云 ECS，依赖少，排障直接。

### 1. 本地打包

```bash
cd /Users/edy/ideaProjects/sunyun-portal
bash scripts/package.sh
```

产物在：

```text
dist/sunyun-portal-<version>.tar.gz
```

### 2. 上传并解压

```bash
scp dist/sunyun-portal-<version>.tar.gz root@your-ecs:/opt/
ssh root@your-ecs
cd /opt
tar -xzf sunyun-portal-<version>.tar.gz
ln -sfn /opt/sunyun-portal-<version> /opt/sunyun-portal
```

### 3. 设置环境变量

```bash
cd /opt/sunyun-portal
cp .env.example .env
vim .env
```

至少修改：

```text
PORT=8080
SUNYUN_ADMIN_TOKEN=替换成强口令
```

### 4. 安装 systemd 服务

```bash
cp /opt/sunyun-portal/deploy/sunyun-portal.service /etc/systemd/system/sunyun-portal.service
systemctl daemon-reload
systemctl enable --now sunyun-portal
systemctl status sunyun-portal
```

健康检查：

```bash
curl http://127.0.0.1:8080/api/health
```

### 5. 配置 Nginx

```bash
cp /opt/sunyun-portal/deploy/nginx.conf.example /etc/nginx/conf.d/sunyun-portal.conf
vim /etc/nginx/conf.d/sunyun-portal.conf
nginx -t
systemctl reload nginx
```

后续配置 HTTPS 和备案号。

## 方案 B：Docker Compose

适合你以后继续加 MySQL、Redis、Umami 统计等服务。

### 1. 准备环境变量

```bash
cd /opt/sunyun-portal
cp .env.example .env
vim .env
```

### 2. 启动

```bash
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:8080/api/health
```

### 3. 查看数据

线索数据保存在宿主机：

```text
/opt/sunyun-portal/data/leads.jsonl
```
