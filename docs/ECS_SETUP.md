# 阿里云 ECS 一次性初始化手册（sunyun-portal 自托管 Runner 部署）

> 用途：让「手机 Codex 改代码 → 合并到 main → ECS 自动部署」跑通。
> 这套只需在服务器上做一次；之后电脑关机也不影响，因为 Runner 主动连 GitHub 拉代码。
> 前置：一台阿里云 ECS（Ubuntu / Alibaba Cloud Linux / CentOS 均可），已放行 22 端口给你当前可信 IP（用完收紧）。

---

## 1. 登录 ECS
- 手机：阿里云 App / 手机浏览器 ECS 控制台「远程连接」，或用 Termius / JuiceSSH。
- 临时放开安全组 22 端口给你的当前出口 IP（不要对 `0.0.0.0/0` 长期开放）。

## 2. 建部署用户（别长期用 root 跑项目）
```bash
adduser deployer
usermod -aG sudo deployer 2>/dev/null || usermod -aG wheel deployer
```

## 3. 安装基础环境 + Docker
Ubuntu / Debian：
```bash
apt update
apt install -y git docker.io docker-compose-plugin
systemctl enable --now docker
usermod -aG docker deployer
```
Alibaba Cloud Linux / CentOS / Rocky：
```bash
yum install -y git docker docker-compose-plugin
systemctl enable --now docker
usermod -aG docker deployer
```

## 4. 准备项目目录与 .env（凭据只放这里，不进代码）
```bash
mkdir -p /opt/sunyun-portal
chown -R deployer:deployer /opt/sunyun-portal

cat > /opt/sunyun-portal/.env <<'EOF'
NODE_ENV=production
# 强随机值，例：openssl rand -hex 32
SUNYUN_ADMIN_TOKEN=__换成强随机值__
# 容器只绑内网，由宿主机 nginx 反代 80/443
SUNYUN_PORT=127.0.0.1:8080
EOF

chown deployer:deployer /opt/sunyun-portal/.env
chmod 600 /opt/sunyun-portal/.env
```

## 5. 注册 GitHub 自托管 Runner（核心）
手机浏览器打开仓库：`Settings → Actions → Runners → New self-hosted runner → Linux x64`，
复制 GitHub 给的安装命令，在 ECS 上以 `deployer` 执行：
```bash
su - deployer
# 粘贴 GitHub 提供的命令，例如：
# mkdir actions-runner && cd actions-runner
# curl -o actions-runner.tar.gz -L <下载链接>
# tar xzf ./actions-runner.tar.gz
# ./config.sh --url https://github.com/<你>/sunyun-portal --token <RUNNER_TOKEN>
# 出现提示时执行：
sudo ./svc.sh install
sudo ./svc.sh start
```
验证：GitHub 仓库 Runners 页面该 Runner 显示 **Idle / Online**。

## 6. 公网访问（安全组 + 反代）
- 阿里云安全组入方向：
  | 端口 | 协议 | 来源 | 用途 |
  |---|---|---|---|
  | 80 | TCP | 0.0.0.0/0 | HTTP |
  | 443 | TCP | 0.0.0.0/0 | HTTPS |
  | 22 | TCP | 仅你的可信 IP | SSH 管理 |
- 在 ECS 上用仓库里的 `deploy/nginx.conf.example` 配宿主机 nginx（监听 80/443，反代 `127.0.0.1:8080`），并 `systemctl enable --now nginx`。
  - HTTPS 建议后续用 certbot 申请免费证书；先跑通 HTTP 也可。
- 容器已设 `SUNYUN_PORT=127.0.0.1:8080`，不对外暴露 8080。

## 7. 日常流程（手机即可）
1. 手机 Codex 改代码 → 创建 PR → 手机 GitHub App 合并到 `main`。
2. Runner 自动 `checkout → docker compose up -d --build → 健康检查`。
3. 浏览器访问公网域名/IP 即可看到更新。

## 排错
- Runner 离线：ECS 上 `su - deployer && sudo ./svc.sh status`。
- 部署失败：仓库 `Actions` 页看日志；或 ECS 上 `docker compose --env-file /opt/sunyun-portal/.env logs` 查容器。
- 改了 `SUNYUN_ADMIN_TOKEN`：直接在 `/opt/sunyun-portal/.env` 改值后重新跑一次部署即可。
