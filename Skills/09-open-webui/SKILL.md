# Skill 09 — Open WebUI

## Objetivo
Instalar e configurar o Open WebUI — interface gráfica web para gerenciar modelos, fazer chat e monitorar o servidor Ollama.

---

## O que é o Open WebUI?
Interface web open-source (similar ao ChatGPT) que se conecta ao Ollama, permitindo:
- Chat com qualquer modelo instalado
- Gerenciamento de modelos (download, remoção)
- Upload de documentos para RAG
- Histórico de conversas
- Múltiplos usuários com login
- Criação de "assistentes" com system prompts

**Repositório:** https://github.com/open-webui/open-webui

---

## Instalação via Docker (Recomendado)

### Ollama e Open WebUI no mesmo servidor

```bash
docker run -d \
  -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### Ollama em servidor separado na rede

```bash
docker run -d \
  -p 3000:8080 \
  -v open-webui:/app/backend/data \
  -e OLLAMA_BASE_URL=http://192.168.1.100:11434 \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### Com GPU (imagem bundled — Ollama + WebUI juntos)

```bash
docker run -d \
  -p 3000:8080 \
  --gpus all \
  -v ollama:/root/.ollama \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:ollama
```

---

## Instalação via Docker Compose (Recomendado para Produção)

Crie o arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama
    container_name: ollama
    restart: always
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    restart: always
    ports:
      - "3000:8080"
    volumes:
      - webui_data:/app/backend/data
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama

volumes:
  ollama_data:
  webui_data:
```

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## Instalação via pip (sem Docker)

```bash
pip install open-webui

# Iniciar
open-webui serve --host 0.0.0.0 --port 3000
```

---

## Primeiro Acesso

```
1. Abrir navegador: http://localhost:3000
2. Criar conta de administrador (primeiro acesso)
3. Ir em Settings → Connections → Ollama URL
4. Verificar se está apontando para http://localhost:11434 (ou IP do servidor)
5. Clicar em "Refresh" para carregar os modelos
```

---

## Gerenciar Modelos pelo Open WebUI

### Baixar novo modelo
```
Settings → Models → "Pull a model from Ollama.com"
→ Digite o nome: deepseek-coder-v2
→ Clique em Pull
```

### Ver modelos instalados
```
Settings → Models → lista completa com tamanho e data
```

### Remover modelo
```
Settings → Models → ícone de lixeira ao lado do modelo
```

---

## Configurar como Serviço Permanente

### Usando systemd (sem Docker)

```bash
# /etc/systemd/system/open-webui.service
[Unit]
Description=Open WebUI
After=network.target ollama.service

[Service]
Type=simple
User=seu_usuario
Environment="OLLAMA_BASE_URL=http://localhost:11434"
ExecStart=/usr/local/bin/open-webui serve --host 0.0.0.0 --port 3000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable open-webui
sudo systemctl start open-webui
```

---

## Variáveis de Ambiente Importantes

```bash
OLLAMA_BASE_URL=http://localhost:11434    # URL do servidor Ollama
WEBUI_SECRET_KEY=chave-secreta-longa     # JWT secret (produção)
WEBUI_AUTH=True                          # Ativar login (padrão: True)
WEBUI_NAME=AgonIA                        # Nome personalizado da interface
DEFAULT_MODELS=deepseek-coder-v2        # Modelo padrão
ENABLE_SIGNUP=False                      # Bloquear novos cadastros
```

---

## Expor para a Rede Local

```bash
# Abrir porta 3000 no firewall (Linux)
sudo ufw allow 3000/tcp

# Acessar de outro computador da rede
http://192.168.1.100:3000
```

---

## Atualizar Open WebUI

```bash
# Docker
docker pull ghcr.io/open-webui/open-webui:main
docker-compose down && docker-compose up -d

# pip
pip install --upgrade open-webui
```

---

## Próxima Etapa
Consulte **Skill 10 — Embeddings e RAG** para criar pipelines de busca semântica com os modelos instalados.
