#!/bin/bash
# ============================================================
# AgonIA — Script de Setup Completo
# Servidor: 10.10.255.111 (Ubuntu 20.04 / 22.04 / 24.04)
#
# Execução:
#   chmod +x setup.sh
#   sudo ./setup.sh
#
# O que este script faz:
#   1. Atualiza o sistema
#   2. Instala Docker + Docker Compose v2
#   3. Cria estrutura de diretórios /data/agonia
#   4. Configura o firewall (ufw)
#   5. Inicia os containers
#   6. Verifica saúde dos serviços
# ============================================================

set -e  # Parar em caso de erro

# --- Cores para output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# --- Variáveis ---
SERVER_IP="10.10.255.111"
DATA_ROOT="/data/agonia"
DEPLOY_DIR="/opt/agonia"
DOCKER_COMPOSE_VERSION="v2.24.5"

# ============================================================
log()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}[!]${NC} $1"; }
error()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
header() { echo -e "\n${CYAN}══════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}══════════════════════════════════════${NC}"; }
# ============================================================

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    error "Execute como root: sudo ./setup.sh"
fi

header "AgonIA — Setup do Servidor"
echo -e "  ${BLUE}Servidor:${NC} $SERVER_IP"
echo -e "  ${BLUE}Data:${NC}     $(date)"
echo -e "  ${BLUE}Ubuntu:${NC}   $(lsb_release -ds 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2)"

# ============================================================
header "PASSO 1 — Atualizar sistema"
# ============================================================
apt-get update -y
apt-get upgrade -y
apt-get install -y \
    curl \
    wget \
    git \
    htop \
    nano \
    net-tools \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    software-properties-common \
    apt-transport-https
log "Sistema atualizado"

# ============================================================
header "PASSO 2 — Instalar Docker"
# ============================================================
if command -v docker &> /dev/null; then
    warn "Docker já instalado: $(docker --version)"
else
    # Remover versões antigas
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Adicionar repositório oficial Docker
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y \
        docker-ce \
        docker-ce-cli \
        containerd.io \
        docker-buildx-plugin \
        docker-compose-plugin

    # Habilitar e iniciar Docker
    systemctl enable docker
    systemctl start docker

    log "Docker instalado: $(docker --version)"
fi

# Verificar Docker Compose
if docker compose version &> /dev/null; then
    log "Docker Compose disponível: $(docker compose version)"
else
    error "Docker Compose não encontrado. Verifique a instalação do Docker."
fi

# ============================================================
header "PASSO 3 — Criar estrutura de diretórios"
# ============================================================
mkdir -p "$DATA_ROOT/models"
mkdir -p "$DATA_ROOT/webui"
mkdir -p "$DATA_ROOT/qdrant"
mkdir -p "$DATA_ROOT/logs"
mkdir -p "$DEPLOY_DIR"

# Permissões
chmod -R 755 "$DATA_ROOT"
chown -R root:root "$DATA_ROOT"

log "Estrutura criada em $DATA_ROOT"
ls -la "$DATA_ROOT"

# ============================================================
header "PASSO 4 — Copiar arquivos de configuração"
# ============================================================

# Copiar docker-compose e .env se existirem no diretório atual
if [ -f "./docker-compose.yml" ]; then
    cp ./docker-compose.yml "$DEPLOY_DIR/docker-compose.yml"
    log "docker-compose.yml copiado para $DEPLOY_DIR"
else
    warn "docker-compose.yml não encontrado no diretório atual — gerando padrão..."
    cat > "$DEPLOY_DIR/docker-compose.yml" << 'COMPOSE_EOF'
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    container_name: agonia-ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - /data/agonia/models:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_KEEP_ALIVE=10m
      - OLLAMA_MAX_LOADED_MODELS=2
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s
    networks:
      - agonia-net

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: agonia-webui
    restart: unless-stopped
    ports:
      - "3000:8080"
    volumes:
      - webui_data:/app/backend/data
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
      - WEBUI_SECRET_KEY=agonia-secret-mude-isso
      - WEBUI_NAME=AgonIA
      - ENABLE_SIGNUP=true
    depends_on:
      ollama:
        condition: service_healthy
    networks:
      - agonia-net

  qdrant:
    image: qdrant/qdrant:latest
    container_name: agonia-qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    networks:
      - agonia-net

volumes:
  webui_data:
  qdrant_data:

networks:
  agonia-net:
    driver: bridge
COMPOSE_EOF
fi

if [ -f "./.env" ]; then
    cp ./.env "$DEPLOY_DIR/.env"
    log ".env copiado para $DEPLOY_DIR"
fi

# ============================================================
header "PASSO 5 — Configurar Firewall (ufw)"
# ============================================================
# Verificar se ufw está ativo
ufw --force enable 2>/dev/null || true

# Regras básicas
ufw default deny incoming
ufw default allow outgoing

# SSH — ESSENCIAL (não fechar!)
ufw allow 22/tcp comment 'SSH'

# AgonIA Services
ufw allow 11434/tcp comment 'Ollama API'
ufw allow 3000/tcp  comment 'Open WebUI'
ufw allow 6333/tcp  comment 'Qdrant REST'
ufw allow 6334/tcp  comment 'Qdrant gRPC'

# HTTP/HTTPS (para futuro proxy reverso)
ufw allow 80/tcp    comment 'HTTP'
ufw allow 443/tcp   comment 'HTTPS'

ufw reload
log "Firewall configurado"
ufw status numbered

# ============================================================
header "PASSO 6 — Iniciar containers"
# ============================================================
cd "$DEPLOY_DIR"

# Pull das imagens primeiro
log "Baixando imagens Docker (pode demorar alguns minutos)..."
docker compose pull

# Subir os containers
log "Iniciando containers..."
docker compose up -d

# Aguardar inicialização
log "Aguardando serviços iniciarem (60s)..."
sleep 60

# ============================================================
header "PASSO 7 — Verificar saúde dos serviços"
# ============================================================
echo ""

# Ollama
if curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
    log "Ollama:     http://$SERVER_IP:11434  ✅ ONLINE"
else
    warn "Ollama:     http://$SERVER_IP:11434  ⏳ Aguardando..."
fi

# Open WebUI
if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    log "Open WebUI: http://$SERVER_IP:3000   ✅ ONLINE"
else
    warn "Open WebUI: http://$SERVER_IP:3000   ⏳ Aguardando (pode demorar mais)..."
fi

# Qdrant
if curl -sf http://localhost:6333/readyz > /dev/null 2>&1; then
    log "Qdrant:     http://$SERVER_IP:6333   ✅ ONLINE"
else
    warn "Qdrant:     http://$SERVER_IP:6333   ⏳ Aguardando..."
fi

# Status dos containers
echo ""
log "Status dos containers:"
docker compose ps

# ============================================================
header "PASSO 8 — Criar serviço systemd (auto-start)"
# ============================================================
cat > /etc/systemd/system/agonia.service << EOF
[Unit]
Description=AgonIA — Servidor Local de IA
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable agonia.service
log "Serviço systemd criado e habilitado no boot"

# ============================================================
header "✅ INSTALAÇÃO CONCLUÍDA"
# ============================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        AgonIA instalado com sucesso!             ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Ollama API:  ${CYAN}http://$SERVER_IP:11434${NC}       ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Open WebUI:  ${CYAN}http://$SERVER_IP:3000${NC}        ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Qdrant:      ${CYAN}http://$SERVER_IP:6333${NC}        ${GREEN}║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Próximo passo: instalar modelos              ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  ${YELLOW}bash /opt/agonia/instalar-modelos.sh${NC}         ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Arquivos em: ${BLUE}$DEPLOY_DIR${NC}"
echo -e "  Modelos em:  ${BLUE}$DATA_ROOT/models${NC}"
echo -e "  Logs:        ${BLUE}docker compose -f $DEPLOY_DIR/docker-compose.yml logs -f${NC}"
echo ""
