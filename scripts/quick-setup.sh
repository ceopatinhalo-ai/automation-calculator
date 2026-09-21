#!/bin/bash
# ==============================================================================
# AutoFlow Tech 1-Click Cloud AI Agent Setup Script
# Project: 12-affiliates — Standalone Autonomous Business 2026
# Target OS: Ubuntu 22.04 / 24.04 LTS on Cloud VPS (Hostinger KVM)
# ==============================================================================

set -e

echo "🚀 [AutoFlow Tech] Bắt đầu thiết lập máy chủ AI Agent tự hành 24/7..."

# 1. Update system
echo "📦 Cập nhật gói hệ thống..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git ufw jq unzip

# 2. Install Docker & Docker Compose if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Đang cài đặt Docker Engine & Docker Compose..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 3. Setup Project Directory
WORK_DIR="/opt/autoflow-agent"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# 4. Generate docker-compose.yml
cat << 'EOF' > docker-compose.yml
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=AutoFlow2026Secure!
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
EOF

# 5. Start Containers
docker compose up -d

# 6. Setup Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5678/tcp
echo "y" | ufw enable || true

SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
echo "================================================================================"
echo "🎉 CÀI ĐẶT THÀNH CÔNG CỖ MÁY AI AGENT!"
echo "🌐 Truy cập n8n Automation Engine tại: http://${SERVER_IP}:5678"
echo "🔑 Tài khoản: admin | Mật khẩu: AutoFlow2026Secure!"
echo "📘 Tham khảo tài liệu & Blueprints tại: https://ceopatinhalo-ai.github.io/automation-calculator/"
echo "================================================================================"
