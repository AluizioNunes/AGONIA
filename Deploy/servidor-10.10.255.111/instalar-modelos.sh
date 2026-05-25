#!/bin/bash
# ============================================================
# AgonIA — Instalação de Modelos LLM e Embeddings
# Servidor: 10.10.255.111
#
# Execute APÓS o setup.sh:
#   bash instalar-modelos.sh
#
# Ou instalar modelo individual:
#   bash instalar-modelos.sh --modelo qwen2.5-coder:7b
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}[!]${NC} $1"; }
header() { echo -e "\n${CYAN}══════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}══════════════════════════════════════${NC}"; }

OLLAMA_CMD="docker exec agonia-ollama ollama"

# Se passado argumento --modelo, instala apenas esse
if [ "$1" = "--modelo" ] && [ -n "$2" ]; then
    header "Instalando modelo: $2"
    $OLLAMA_CMD pull "$2"
    log "Modelo $2 instalado"
    $OLLAMA_CMD list
    exit 0
fi

# ============================================================
header "Verificar conexão com Ollama"
# ============================================================
if ! curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
    warn "Ollama não está respondendo. Verificar: docker compose ps"
    exit 1
fi
log "Ollama online"

# ============================================================
header "GRUPO 1 — Modelo de Embedding (instalar primeiro)"
# ============================================================
# Necessário para Continue.dev e RAG — pequeno e rápido
echo "→ nomic-embed-text (274 MB) — embedding padrão"
$OLLAMA_CMD pull nomic-embed-text
log "nomic-embed-text instalado"

# ============================================================
header "GRUPO 2 — LLM para Código (escolha conforme hardware)"
# ============================================================

# Detectar VRAM disponível
VRAM_MB=0
if command -v nvidia-smi &> /dev/null; then
    VRAM_MB=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>/dev/null | head -1 | tr -d ' ')
    log "GPU detectada — VRAM: ${VRAM_MB} MiB"
else
    warn "GPU NVIDIA não detectada — usando CPU"
fi

if [ "$VRAM_MB" -ge 20000 ] 2>/dev/null; then
    # GPU >= 20 GB VRAM (RTX 3090/4090/A5000)
    header "GPU >= 20GB — Instalando modelos premium"
    echo "→ qwen2.5-coder:32b (~20GB) — qualidade máxima"
    $OLLAMA_CMD pull qwen2.5-coder:32b
    echo "→ deepseek-coder-v2 (~9GB) — uso geral"
    $OLLAMA_CMD pull deepseek-coder-v2
    echo "→ deepseek-r1:14b (~8GB) — raciocínio"
    $OLLAMA_CMD pull deepseek-r1:14b

elif [ "$VRAM_MB" -ge 8000 ] 2>/dev/null; then
    # GPU 8-12 GB VRAM (RTX 3070/3080/4070)
    header "GPU 8-12GB — Instalando modelos intermediários"
    echo "→ deepseek-coder-v2 (~9GB) — principal"
    $OLLAMA_CMD pull deepseek-coder-v2
    echo "→ qwen2.5-coder:7b (~5GB) — tarefas rápidas"
    $OLLAMA_CMD pull qwen2.5-coder:7b

elif [ "$VRAM_MB" -ge 4000 ] 2>/dev/null; then
    # GPU 4-6 GB VRAM (RTX 3050/3060/4060)
    header "GPU 4-6GB — Instalando modelos compactos"
    echo "→ qwen2.5-coder:7b (~5GB) — principal"
    $OLLAMA_CMD pull qwen2.5-coder:7b
    echo "→ starcoder2:3b (~2GB) — fallback rápido"
    $OLLAMA_CMD pull starcoder2:3b

else
    # Apenas CPU
    header "CPU only — Instalando modelo leve"
    warn "Sem GPU — modelos serão lentos (~1-3 tok/s)"
    echo "→ qwen2.5-coder:7b — principal"
    $OLLAMA_CMD pull qwen2.5-coder:7b
    echo "→ starcoder2:3b — autocomplete leve"
    $OLLAMA_CMD pull starcoder2:3b
fi

# ============================================================
header "GRUPO 3 — Embedding extra (opcional)"
# ============================================================
read -p "Instalar mxbai-embed-large (670MB, melhor qualidade)? [s/N] " RESP
if [[ "$RESP" =~ ^[Ss]$ ]]; then
    $OLLAMA_CMD pull mxbai-embed-large
    log "mxbai-embed-large instalado"
fi

# ============================================================
header "RESULTADO — Modelos instalados"
# ============================================================
$OLLAMA_CMD list

echo ""
log "Instalação de modelos concluída!"
echo ""
echo "Testar via API:"
echo "  curl http://localhost:11434/v1/models"
echo ""
echo "Testar geração:"
echo "  curl http://localhost:11434/v1/chat/completions \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -H 'Authorization: Bearer ollama' \\"
echo "    -d '{\"model\":\"qwen2.5-coder:7b\",\"messages\":[{\"role\":\"user\",\"content\":\"oi\"}]}'"
