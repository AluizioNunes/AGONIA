# Deploy da Stack AgonIA em Servidor Remoto

## Visão Geral

Este documento descreve como fazer o deploy da stack AgonIA em um servidor remoto usando Docker Compose.

## Serviços da Stack

- **Ollama**: Servidor de modelos LLM (porta 11434)
- **Open WebUI**: Interface web frontend (porta 3000)
- **Qdrant**: Banco de vetores para RAG (porta 6333)
- **Nginx**: Reverse proxy para produção (portas 80/443) - opcional

## Pré-requisitos do Servidor

- Ubuntu 20.04+ ou Debian 11+
- GPU NVIDIA com drivers CUDA (opcional, mas recomendado)
- Mínimo 16GB RAM
- Mínimo 100GB disco SSD
- Acesso SSH

## Deploy Rápido

### 1. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
# Edite .env conforme necessário
```

### 2. Deploy Automático

```bash
chmod +x deploy.sh
./deploy.sh usuario@seu-servidor.com
```

### 3. Deploy Manual

```bash
# Copiar arquivos para o servidor
scp docker-compose.yml .env nginx.conf usuario@servidor:/opt/agonia/

# SSH no servidor
ssh usuario@servidor
cd /opt/agonia

# Iniciar containers
docker-compose up -d

# Baixar modelos
docker exec agonia-ollama bash -c "$(cat pull-models.sh)"
```

## Acesso aos Serviços

Após o deploy:

- **Open WebUI**: http://seu-servidor:3000
- **Ollama API**: http://seu-servidor:11434
- **Qdrant**: http://seu-servidor:6333

## Configuração de IDEs Locais

### Cursor IDE

```
OpenAI Base URL: http://seu-servidor:11434/v1
OpenAI API Key: ollama
Model: deepseek-coder-v2
```

### Continue.dev (VSCode)

Editar `~/.continue/config.json`:

```json
{
  "models": [{
    "title": "AgonIA Remote",
    "provider": "ollama",
    "model": "deepseek-coder-v2",
    "apiBase": "http://seu-servidor:11434"
  }],
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://seu-servidor:11434"
  }
}
```

## Gerenciamento dos Containers

### Ver Status

```bash
ssh usuario@servidor
cd /opt/agonia
docker-compose ps
```

### Ver Logs

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f ollama
docker-compose logs -f open-webui
```

### Reiniciar Serviços

```bash
docker-compose restart
docker-compose restart ollama
```

### Atualizar Stack

```bash
docker-compose pull
docker-compose up -d
```

### Parar Stack

```bash
docker-compose down
```

## Modelos Disponíveis

Após o deploy inicial, os seguintes modelos são baixados:

- `deepseek-coder-v2` - LLM principal para código
- `qwen2.5-coder:7b` - LLM rápido para tarefas simples
- `nomic-embed-text` - Embeddings para RAG
- `mxbai-embed-large` - Embeddings de alta qualidade
- `deepseek-r1:14b` - Raciocínio complexo
- `starcoder2:3b` - Modelo leve para hardware limitado

## Adicionar Novos Modelos

```bash
# No servidor
docker exec agonia-ollama ollama pull nome-do-modelo
```

## Backup

### Backup dos Modelos

```bash
# No servidor
docker exec agonia-ollama tar czf /tmp/ollama-backup.tar.gz /root/.ollama
scp usuario@servidor:/tmp/ollama-backup.tar.gz ./backup/
```

### Backup do Open WebUI

```bash
# No servidor
docker exec agonia-webui tar czf /tmp/webui-backup.tar.gz /app/backend/data
scp usuario@servidor:/tmp/webui-backup.tar.gz ./backup/
```

## Troubleshooting

### Ollama não responde

```bash
docker exec agonia-ollama ollama list
docker-compose restart ollama
```

### Open WebUI não conecta ao Ollama

```bash
# Verificar rede
docker network inspect agonia-network
docker-compose restart open-webui
```

### GPU não sendo usada

```bash
# Verificar se GPU está disponível no container
docker exec agonia-ollama nvidia-smi

# Se não funcionar, verificar drivers no host
nvidia-smi
```

### Espaço em disco

```bash
# Ver tamanho dos volumes
docker system df

# Limpar recursos não usados
docker system prune -a
```

## Segurança

### Firewall

```bash
# No servidor, liberar portas necessárias
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Open WebUI (se não usar Nginx)
sudo ufw enable
```

### SSL com Nginx

Para produção com HTTPS:

1. Obter certificado SSL (Let's Encrypt recomendado)
2. Colocar certificados em `nginx/ssl/`
3. Ativar profile de produção:

```bash
docker-compose --profile production up -d
```

## Monitoramento

### Health Check

```bash
# Verificar se Ollama está respondendo
curl http://seu-servidor:11434/api/tags

# Verificar Open WebUI
curl http://seu-servidor:3000
```

### Monitoramento de GPU

```bash
# No servidor
watch -n 1 nvidia-smi
```

## Próximos Passos

Após o deploy bem-sucedido:

1. Acesse o Open WebUI em http://seu-servidor:3000
2. Crie sua conta de administrador
3. Configure seus IDEs locais (Cursor, Continue.dev, TRAE)
4. Comece a usar os modelos locais
