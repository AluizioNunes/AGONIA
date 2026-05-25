#!/bin/bash
# Script de Deploy da Stack AgonIA em Servidor Remoto
# Uso: ./deploy.sh [usuario@servidor]

set -e

SERVER=${1:-"root@192.168.1.100"}
PROJECT_DIR="/opt/agonia"

echo "=== Deploy AgonIA para $SERVER ==="

# 1. Criar diretório no servidor
echo "[1/6] Criando diretório do projeto no servidor..."
ssh $SERVER "mkdir -p $PROJECT_DIR"

# 2. Copiar arquivos
echo "[2/6] Copiando arquivos para o servidor..."
scp docker-compose.yml $SERVER:$PROJECT_DIR/
scp .env.example $SERVER:$PROJECT_DIR/
scp nginx.conf $SERVER:$PROJECT_DIR/

# 3. Configurar variáveis de ambiente
echo "[3/6] Configurando .env no servidor..."
ssh $SERVER "cd $PROJECT_DIR && if [ ! -f .env ]; then cp .env.example .env; fi"

# 4. Instalar Docker e Docker Compose (se necessário)
echo "[4/6] Verificando Docker no servidor..."
ssh $SERVER "command -v docker >/dev/null 2>&1 || { curl -fsSL https://get.docker.com | sh; usermod -aG docker \$USER; }"
ssh $SERVER "command -v docker-compose >/dev/null 2>&1 || { apt-get update && apt-get install -y docker-compose; }"

# 5. Iniciar containers
echo "[5/6] Iniciando containers Docker..."
ssh $SERVER "cd $PROJECT_DIR && docker-compose pull"
ssh $SERVER "cd $PROJECT_DIR && docker-compose up -d"

# 6. Baixar modelos iniciais
echo "[6/6] Baixando modelos iniciais (isso pode demorar)..."
ssh $SERVER "docker exec agonia-ollama ollama pull deepseek-coder-v2"
ssh $SERVER "docker exec agonia-ollama ollama pull nomic-embed-text"

echo ""
echo "=== Deploy Concluído ==="
echo "Open WebUI: http://$SERVER:3000"
echo "Ollama API: http://$SERVER:11434"
echo "Qdrant: http://$SERVER:6333"
echo ""
echo "Para ver logs: ssh $SERVER 'cd $PROJECT_DIR && docker-compose logs -f'"
