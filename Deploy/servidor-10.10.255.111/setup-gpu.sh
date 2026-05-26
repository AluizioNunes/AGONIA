#!/bin/bash
# ============================================================
# AgonIA — Habilitar GPU NVIDIA (executar APÓS setup.sh)
#
# Execute apenas se o servidor tiver GPU NVIDIA:
#   sudo bash setup-gpu.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}[!]${NC} $1"; }
error()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
header() { echo -e "\n${CYAN}══════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}══════════════════════════════════════${NC}"; }

if [ "$EUID" -ne 0 ]; then
    error "Execute como root: sudo bash setup-gpu.sh"
fi

# ============================================================
header "PASSO 1 — Verificar GPU NVIDIA"
# ============================================================
if ! lspci | grep -i nvidia > /dev/null 2>&1; then
    error "Nenhuma GPU NVIDIA detectada neste servidor."
fi
log "GPU NVIDIA detectada:"
lspci | grep -i nvidia

# ============================================================
header "PASSO 2 — Instalar drivers NVIDIA"
# ============================================================
if command -v nvidia-smi &> /dev/null; then
    warn "Drivers já instalados: $(nvidia-smi --version | head -1)"
else
    # Detectar versão Ubuntu
    UBUNTU_VERSION=$(lsb_release -rs)
    log "Ubuntu $UBUNTU_VERSION detectado"

    # Adicionar repositório de drivers
    add-apt-repository ppa:graphics-drivers/ppa -y
    apt-get update -y

    # Instalar driver recomendado automaticamente
    ubuntu-drivers autoinstall

    log "Driver NVIDIA instalado. Um reboot pode ser necessário."
fi

# ============================================================
header "PASSO 3 — Instalar NVIDIA Container Toolkit"
# ============================================================
if dpkg -l | grep -q nvidia-container-toolkit; then
    warn "NVIDIA Container Toolkit já instalado"
else
    # Repositório oficial NVIDIA
    curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
        gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

    curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
        sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
        tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

    apt-get update -y
    apt-get install -y nvidia-container-toolkit

    # Configurar Docker para usar o runtime NVIDIA
    nvidia-ctk runtime configure --runtime=docker
    systemctl restart docker

    log "NVIDIA Container Toolkit instalado"
fi

# ============================================================
header "PASSO 4 — Atualizar docker-compose.yml para GPU"
# ============================================================
COMPOSE_FILE="/opt/agonia/docker-compose.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    error "docker-compose.yml não encontrado em /opt/agonia/. Execute setup.sh primeiro."
fi

# Fazer backup
cp "$COMPOSE_FILE" "${COMPOSE_FILE}.bak"

# Substituir seção de GPU no Ollama (descomenta as linhas)
sed -i 's/    # deploy:/    deploy:/g' "$COMPOSE_FILE"
sed -i 's/    #   resources:/      resources:/g' "$COMPOSE_FILE"
sed -i 's/    #     reservations:/        reservations:/g' "$COMPOSE_FILE"
sed -i 's/    #       devices:/          devices:/g' "$COMPOSE_FILE"
sed -i 's/    #         - driver: nvidia/            - driver: nvidia/g' "$COMPOSE_FILE"
sed -i 's/    #           count: all/              count: all/g' "$COMPOSE_FILE"
sed -i 's/    #           capabilities: \[gpu\]/              capabilities: [gpu]/g' "$COMPOSE_FILE"

log "docker-compose.yml atualizado para GPU"

# ============================================================
header "PASSO 5 — Reiniciar Ollama com suporte GPU"
# ============================================================
cd /opt/agonia

docker compose stop ollama
docker compose up -d ollama

log "Ollama reiniciado com suporte GPU"

# Aguardar
sleep 20

# ============================================================
header "PASSO 6 — Verificar GPU no container"
# ============================================================
if docker exec agonia-ollama nvidia-smi > /dev/null 2>&1; then
    log "GPU acessível dentro do container Ollama:"
    docker exec agonia-ollama nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
else
    warn "GPU não detectada dentro do container. Verifique se o driver está correto."
    warn "Tente reiniciar o servidor: sudo reboot"
fi

echo ""
log "Setup de GPU concluído!"
echo ""
echo "Teste: docker exec agonia-ollama nvidia-smi"
echo "Logs:  docker compose -f /opt/agonia/docker-compose.yml logs ollama"
