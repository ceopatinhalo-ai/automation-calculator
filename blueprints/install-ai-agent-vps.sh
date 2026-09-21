#!/usr/bin/env bash
# ==============================================================================
# 🚀 1-CLICK AI AGENT & AUTOMATION VPS INSTALLER (HOSTINGER / UBUNTU)
# Dự Án: 12-affiliates — AutoFlow Tech
# Tác dụng:
# 1. Cài đặt Docker & Docker Compose mới nhất.
# 2. Cài đặt n8n workflow automation tự khởi động 24/7.
# 3. Cài đặt môi trường Python 3, Node.js 22 LTS cho AI Agent (Claude Code / Hermes).
# 4. Kích hoạt tường lửa UFW và tối ưu bảo mật máy chủ.
# ==============================================================================

set -e

echo "========================================================"
echo "⚡ KHỞI ĐỘNG CÀI ĐẶT MÁY CHỦ AI AGENT 24/7 (AUTOFLOW TECH)"
echo "========================================================"

# 1. Cập nhật hệ điều hành
echo "📦 1/5: Cập nhật danh mục gói hệ thống..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git ufw htop ca-certificates gnupg lsb-release

# 2. Cài đặt Docker & Docker Compose
echo "🐳 2/5: Cài đặt Docker Engine..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    echo "✅ Docker đã sẵn sàng!"
else
    echo "✅ Docker đã có sẵn trên hệ thống."
fi

# 3. Cài đặt n8n chạy nền qua Docker
echo "🔄 3/5: Thiết lập n8n Workflow Automation 24/7..."
mkdir -p ~/n8n-docker
cat << 'EOF' > ~/n8n-docker/docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n_automation
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=AutoFlow2026@Secure
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Asia/Ho_Chi_Minh
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
EOF

cd ~/n8n-docker
sudo docker compose down 2>/dev/null || true
sudo docker compose up -d
echo "✅ n8n đang chạy ngầm tại cổng 5678!"

# 4. Cài đặt Node.js 22 LTS & Python 3
echo "🧠 4/5: Cài đặt môi trường AI Agent (Node.js & Python)..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
sudo apt-get install -y python3 python3-pip python3-venv

# 5. Cấu hình tường lửa UFW
echo "🛡️ 5/5: Cấu hình tường lửa an toàn..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5678/tcp
sudo ufw --force enable

SERVER_IP=$(curl -s ifconfig.me || echo "IP_CỦA_BẠN")

echo "========================================================"
echo "🎉 CÀI ĐẶT HOÀN TẤT THÀNH CÔNG 100%!"
echo "🌐 Truy cập n8n: http://${SERVER_IP}:5678"
echo "👤 Tài khoản mặc định: admin"
echo "🔑 Mật khẩu mặc định: AutoFlow2026@Secure"
echo "========================================================"
