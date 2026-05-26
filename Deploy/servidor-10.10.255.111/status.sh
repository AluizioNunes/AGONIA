#!/bin/bash
# ============================================================
# AgonIA — Health Check e Status Completo
#
# Uso:
#   bash status.sh          → status completo
#   bash status.sh --watch  → monitoramento contínuo (5s)
# ============================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVER_IP="${SERVER_IP:-$(hostname -I | awk '{print $1}')}"

check_service() {
    local nome="$1"
    local url="$2"
    local porta="$3"

    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $nome${NC}  →  ${CYAN}http://$SERVER_IP:$porta${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $nome${NC}  →  ${RED}http://$SERVER_IP:$porta (offline)${NC}"
        return 1
    fi
}

show_status() {
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║          AgonIA — Status do Servidor             ║${NC}"
    echo -e "${CYAN}║          $SERVER_IP  •  $(date '+%H:%M:%S')              ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""

    # --- Serviços ---
    echo -e "${BLUE}▶ Serviços:${NC}"
    check_service "Ollama API  " "http://localhost:11434/api/tags"  "11434"
    check_service "Open WebUI  " "http://localhost:3000/health"     "3000"
    check_service "Qdrant      " "http://localhost:6333/readyz"      "6333"
    echo ""

    # --- Containers Docker ---
    echo -e "${BLUE}▶ Containers:${NC}"
    docker compose -f /opt/agonia/docker-compose.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | \
        sed 's/running/\o033[32mrunning\o033[0m/g' | \
        sed 's/exited/\o033[31mexited\o033[0m/g' | \
        awk 'NR==1{print "  "$0} NR>1{print "  "$0}'
    echo ""

    # --- Modelos instalados ---
    echo -e "${BLUE}▶ Modelos Ollama:${NC}"
    if curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
        MODELOS=$(curl -sf http://localhost:11434/api/tags | \
            python3 -c "
import json, sys
data = json.load(sys.stdin)
models = data.get('models', [])
if not models:
    print('  Nenhum modelo instalado')
for m in models:
    size_gb = m['size'] / 1e9
    print(f\"  • {m['name']:<35} {size_gb:.1f} GB\")
" 2>/dev/null)
        echo "$MODELOS"
    else
        echo -e "  ${YELLOW}Ollama offline — não foi possível listar modelos${NC}"
    fi
    echo ""

    # --- GPU ---
    if command -v nvidia-smi &> /dev/null; then
        echo -e "${BLUE}▶ GPU:${NC}"
        GPU_INFO=$(nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu,temperature.gpu \
            --format=csv,noheader,nounits 2>/dev/null)
        if [ -n "$GPU_INFO" ]; then
            echo "$GPU_INFO" | while IFS=',' read -r nome mem_usada mem_total util temp; do
                nome=$(echo "$nome" | xargs)
                mem_usada=$(echo "$mem_usada" | xargs)
                mem_total=$(echo "$mem_total" | xargs)
                util=$(echo "$util" | xargs)
                temp=$(echo "$temp" | xargs)
                PCT=$((mem_usada * 100 / mem_total))
                echo -e "  ${nome}"
                echo -e "  VRAM: ${mem_usada}/${mem_total} MiB (${PCT}%) | Uso: ${util}% | Temp: ${temp}°C"
            done
        fi
    fi

    # --- Disco ---
    echo ""
    echo -e "${BLUE}▶ Armazenamento (/data/agonia):${NC}"
    if [ -d "/data/agonia" ]; then
        du -sh /data/agonia/* 2>/dev/null | awk '{print "  "$2"  "$1}'
        echo ""
        df -h /data/agonia | awk 'NR==2{print "  Disco total: "$2" | Usado: "$3" | Livre: "$4" ("$5")"}'
    else
        echo "  /data/agonia não encontrado"
    fi

    # --- Memória RAM ---
    echo ""
    echo -e "${BLUE}▶ RAM:${NC}"
    free -h | awk 'NR==2{printf "  Total: %s | Usado: %s | Livre: %s\n", $2, $3, $4}'
}

# Loop de monitoramento
if [ "$1" = "--watch" ]; then
    while true; do
        show_status
        echo ""
        echo -e "  ${YELLOW}Atualizando em 5s... (Ctrl+C para sair)${NC}"
        sleep 5
    done
else
    show_status
fi
