# Skill 02 — Gestão de Modelos

## Objetivo
Instalar, listar, atualizar e remover modelos LLM e de embedding no Ollama.

---

## Comandos Essenciais

### Baixar um modelo
```bash
ollama pull <nome-do-modelo>

# Exemplos:
ollama pull deepseek-coder-v2
ollama pull qwen2.5-coder:7b
ollama pull nomic-embed-text
```

### Listar modelos instalados
```bash
ollama list

# Saída esperada:
# NAME                    ID              SIZE    MODIFIED
# deepseek-coder-v2       abc123...       8.9 GB  2 hours ago
# nomic-embed-text        def456...       274 MB  1 day ago
```

### Remover um modelo
```bash
ollama rm deepseek-coder-v2
```

### Atualizar um modelo (re-pull)
```bash
ollama pull deepseek-coder-v2   # baixa versão mais recente
```

### Ver detalhes de um modelo
```bash
ollama show deepseek-coder-v2

# Mostra: parâmetros, template, tamanho, licença
```

### Copiar/renomear um modelo
```bash
ollama cp deepseek-coder-v2 meu-modelo-codigo
```

---

## Executar Modelos (Teste Rápido)

### Modo interativo (chat no terminal)
```bash
ollama run deepseek-coder-v2
```

### Modo one-shot (sem entrar no chat)
```bash
ollama run qwen2.5-coder:7b "Escreva uma função Python para ordenar uma lista"
```

### Via API REST (cURL)
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-coder-v2",
  "prompt": "Escreva um hello world em Go",
  "stream": false
}'
```

---

## Gerenciar via API OpenAI-Compatible

### Listar modelos instalados
```bash
curl http://localhost:11434/v1/models
```

### Chat completion
```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ollama" \
  -d '{
    "model": "deepseek-coder-v2",
    "messages": [
      {"role": "user", "content": "Explique o que é uma closure em JavaScript"}
    ]
  }'
```

### Embedding
```bash
curl http://localhost:11434/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ollama" \
  -d '{
    "model": "nomic-embed-text",
    "input": "Texto para gerar embedding"
  }'
```

---

## Localização dos Arquivos

| Sistema | Caminho padrão dos modelos |
|---|---|
| Linux | `~/.ollama/models` |
| Windows | `C:\Users\<user>\.ollama\models` |
| macOS | `~/.ollama/models` |
| Docker | volume `ollama` → `/root/.ollama/models` |

### Mover modelos para outro disco (Linux)

```bash
# 1. Parar o serviço
sudo systemctl stop ollama

# 2. Mover os dados
mv ~/.ollama/models /data/ollama/models

# 3. Configurar variável de ambiente no systemd
sudo systemctl edit ollama.service
# Adicionar: Environment="OLLAMA_MODELS=/data/ollama/models"

# 4. Reiniciar
sudo systemctl daemon-reload
sudo systemctl start ollama
```

---

## Script de Instalação em Lote

Crie um arquivo `instalar-modelos.sh` (Linux) ou `instalar-modelos.bat` (Windows):

```bash
#!/bin/bash
# instalar-modelos.sh
# Instala todos os modelos do projeto AgonIA

echo "=== Instalando modelos LLM para código ==="
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder-v2

echo "=== Instalando modelos de embedding ==="
ollama pull nomic-embed-text
ollama pull mxbai-embed-large

echo "=== Modelos instalados ==="
ollama list
```

```bat
@echo off
REM instalar-modelos.bat
echo === Instalando modelos LLM para codigo ===
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder-v2

echo === Instalando modelos de embedding ===
ollama pull nomic-embed-text

echo === Concluido ===
ollama list
pause
```

---

## Próxima Etapa
Consulte **Skill 03 — Modelos LLM para Código** para escolher os melhores modelos conforme seu hardware.
