# Skill 01 — Instalação do Ollama

## Objetivo
Instalar o Ollama no servidor local para servir modelos LLM e de embedding via API compatível com OpenAI.

---

## Pré-requisitos

| Item | Mínimo | Recomendado |
|---|---|---|
| RAM | 8 GB | 16 GB+ |
| Armazenamento | 20 GB livres | 100 GB+ SSD |
| GPU (opcional) | — | NVIDIA 8 GB VRAM+ |
| SO | Windows 10, Ubuntu 20.04, macOS 12 | Ubuntu 22.04 LTS |

---

## Instalação por Sistema Operacional

### Linux (Ubuntu/Debian — recomendado para servidor)

```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Verificar instalação
ollama --version

# O serviço já sobe automaticamente como systemd
systemctl status ollama
```

### Windows

```powershell
# Baixar e executar o instalador gráfico:
# https://ollama.com/download/OllamaSetup.exe

# Após instalar, verificar no terminal:
ollama --version
```

### macOS

```bash
# Via instalador gráfico:
# https://ollama.com/download/Ollama-darwin.zip

# Ou via Homebrew:
brew install ollama

# Iniciar o serviço:
ollama serve
```

### Docker (qualquer SO)

```bash
# CPU apenas
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Com GPU NVIDIA
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

---

## Verificar que está funcionando

```bash
# Verificar API
curl http://localhost:11434/api/tags

# Deve retornar JSON com lista de modelos (vazia inicialmente):
# {"models":[]}

# Verificar endpoint OpenAI-compatible
curl http://localhost:11434/v1/models
```

---

## Configuração do Serviço (Linux/systemd)

```bash
# Ver logs em tempo real
journalctl -u ollama -f

# Reiniciar serviço
sudo systemctl restart ollama

# Habilitar na inicialização (já é padrão)
sudo systemctl enable ollama
```

---

## Variáveis de Ambiente Importantes

```bash
# Localização dos modelos (padrão: ~/.ollama/models)
OLLAMA_MODELS=/caminho/personalizado/modelos

# Endereço de escuta (padrão: 127.0.0.1:11434)
OLLAMA_HOST=0.0.0.0   # expõe para rede local

# Número máximo de modelos carregados em memória simultaneamente
OLLAMA_MAX_LOADED_MODELS=2

# Tempo que o modelo fica na memória após última requisição
OLLAMA_KEEP_ALIVE=5m
```

### Aplicar variáveis no systemd (Linux)

```bash
sudo systemctl edit ollama.service
```

Adicionar dentro do arquivo:
```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
Environment="OLLAMA_MODELS=/data/ollama/models"
Environment="OLLAMA_KEEP_ALIVE=10m"
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## Suporte a GPU

### NVIDIA

```bash
# Instalar drivers NVIDIA e CUDA toolkit (Ubuntu)
sudo apt install nvidia-driver-535
sudo apt install nvidia-cuda-toolkit

# Verificar reconhecimento
nvidia-smi
ollama run llama3.2 "teste"   # vai usar GPU automaticamente
```

### AMD (ROCm)

```bash
# Usar imagem Docker com suporte ROCm
docker run -d --device /dev/kfd --device /dev/dri \
  -v ollama:/root/.ollama -p 11434:11434 \
  --name ollama ollama/ollama:rocm
```

---

## Próxima Etapa
Após instalar, siga o **Skill 02 — Gestão de Modelos** para baixar os primeiros modelos.
