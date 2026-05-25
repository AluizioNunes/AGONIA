# Skill 12 — Monitoramento e Manutenção

## Objetivo
Monitorar a saúde do servidor Ollama, gerenciar recursos, diagnosticar problemas e manter o sistema atualizado.

---

## Monitoramento em Tempo Real

### GPU (NVIDIA)
```bash
# Monitoramento contínuo da GPU
watch -n 1 nvidia-smi

# Ver VRAM usada pelo Ollama especificamente
nvidia-smi --query-compute-apps=pid,used_memory --format=csv

# Log de uso da GPU com timestamp
nvidia-smi dmon -s u -d 5 >> gpu_log.txt &
```

### CPU e RAM
```bash
# Ver processos Ollama
htop -p $(pgrep -d, ollama)

# Uso de memória do Ollama
ps aux | grep ollama

# Monitoramento simples
watch -n 2 "ps aux | grep ollama | head -5"
```

### Logs do Ollama
```bash
# Linux (systemd) — logs em tempo real
journalctl -u ollama -f

# Últimas 100 linhas
journalctl -u ollama -n 100

# Filtrar por erro
journalctl -u ollama | grep -i error

# Docker
docker logs ollama -f
docker logs ollama --tail 100
```

---

## Health Check

### Script de health check básico
```bash
#!/bin/bash
# health-check.sh

OLLAMA_URL="http://localhost:11434"
STATUS=0

echo "=== AgonIA Health Check ==="
echo "$(date)"

# 1. Verificar se API responde
if curl -sf "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
    echo "✅ Ollama API: OK"
else
    echo "❌ Ollama API: FALHOU"
    STATUS=1
fi

# 2. Contar modelos instalados
N_MODELOS=$(curl -sf "$OLLAMA_URL/api/tags" | python3 -c "import json,sys; print(len(json.load(sys.stdin)['models']))" 2>/dev/null)
echo "📦 Modelos instalados: ${N_MODELOS:-0}"

# 3. Verificar GPU
if command -v nvidia-smi &> /dev/null; then
    GPU_MEM=$(nvidia-smi --query-gpu=memory.used,memory.total --format=csv,noheader,nounits | head -1)
    echo "🎮 GPU VRAM: ${GPU_MEM} MiB"
fi

# 4. Verificar espaço em disco
DISCO=$(df -h ~/.ollama/models 2>/dev/null || df -h /root/.ollama/models 2>/dev/null)
echo "💾 Disco:"
echo "$DISCO" | tail -1

echo "========================="
exit $STATUS
```

```bash
chmod +x health-check.sh

# Rodar manualmente
./health-check.sh

# Agendar via cron (a cada 5 min)
*/5 * * * * /caminho/para/health-check.sh >> /var/log/agonia-health.log 2>&1
```

---

## Teste de Performance

```bash
# Medir tempo de resposta e tokens/segundo
#!/bin/bash
# benchmark.sh

MODEL="${1:-deepseek-coder-v2}"
PROMPT="Escreva uma função Python para calcular o enésimo número de Fibonacci de forma iterativa."

echo "=== Benchmark: $MODEL ==="
START=$(date +%s%N)

RESPOSTA=$(curl -s http://localhost:11434/api/generate \
  -d "{\"model\":\"$MODEL\",\"prompt\":\"$PROMPT\",\"stream\":false}" \
  | python3 -c "import json,sys; r=json.load(sys.stdin); print(f'Tokens: {r[\"eval_count\"]} | Tempo: {r[\"eval_duration\"]/1e9:.1f}s | Velocidade: {r[\"eval_count\"]/(r[\"eval_duration\"]/1e9):.1f} tok/s')")

echo "$RESPOSTA"
```

---

## Gerenciamento de Recursos

### Ver espaço ocupado por modelo
```bash
ollama list   # mostra tamanho de cada modelo

# Espaço total usado
du -sh ~/.ollama/models/
```

### Limpar modelos não utilizados
```bash
# Listar modelos que podem ser removidos
ollama list

# Remover modelo específico
ollama rm starcoder2:3b

# Manter apenas os modelos essenciais
# (crie um script com os modelos que quer manter e remova o resto)
```

### Controlar quantos modelos ficam na memória
```bash
# Máximo de modelos simultâneos em VRAM
OLLAMA_MAX_LOADED_MODELS=1   # conservar memória
OLLAMA_MAX_LOADED_MODELS=3   # se tiver muita VRAM

# Tempo que o modelo fica carregado após última requisição
OLLAMA_KEEP_ALIVE=5m         # padrão
OLLAMA_KEEP_ALIVE=0          # descarregar imediatamente após resposta
OLLAMA_KEEP_ALIVE=-1         # nunca descarregar (mantém em memória permanente)
```

---

## Atualizações

### Atualizar Ollama

```bash
# Linux — re-rodar o script de instalação atualiza automaticamente
curl -fsSL https://ollama.com/install.sh | sh

# Verificar versão instalada
ollama --version
```

### Atualizar modelos
```bash
# Re-pull atualiza para a versão mais recente da tag
ollama pull deepseek-coder-v2
ollama pull nomic-embed-text

# Script para atualizar todos os modelos instalados
#!/bin/bash
echo "=== Atualizando todos os modelos ==="
ollama list | awk 'NR>1 {print $1}' | while read modelo; do
    echo "Atualizando: $modelo"
    ollama pull "$modelo"
done
echo "=== Atualização concluída ==="
```

### Atualizar Open WebUI (Docker)
```bash
docker pull ghcr.io/open-webui/open-webui:main
docker stop open-webui
docker rm open-webui
# Re-rodar o comando docker run do Skill 09
```

---

## Diagnóstico de Problemas Comuns

### Problema: Respostas muito lentas
```bash
# 1. Verificar se GPU está sendo usada
nvidia-smi   # deve mostrar ollama usando a GPU

# 2. Verificar se modelo cabe na VRAM
# Se não couber, roda parcialmente em CPU (lento)
ollama show deepseek-coder-v2 | grep parameters

# 3. Solução: usar modelo menor
ollama run qwen2.5-coder:7b
```

### Problema: "Out of memory" / OOM
```bash
# Reduzir modelos em memória
export OLLAMA_MAX_LOADED_MODELS=1

# Usar modelo quantizado (menor)
ollama pull qwen2.5-coder:7b-q4_0   # quantização 4-bit
```

### Problema: Porta 11434 já em uso
```bash
# Ver o que está usando a porta
sudo lsof -i :11434
# ou
sudo netstat -tlnp | grep 11434

# Matar processo
sudo kill -9 <PID>
```

### Problema: Serviço não inicia no boot
```bash
# Verificar status
sudo systemctl status ollama

# Habilitar no boot
sudo systemctl enable ollama

# Ver erros de inicialização
sudo journalctl -u ollama --since "10 minutes ago"
```

---

## Monitoramento com Script Python

```python
# monitor.py — painel de saúde no terminal
import requests
import time
import subprocess

OLLAMA_URL = "http://localhost:11434"

def get_modelos():
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        return r.json().get("models", [])
    except Exception:
        return None

def get_gpu_info():
    try:
        out = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=name,memory.used,memory.total,utilization.gpu",
             "--format=csv,noheader,nounits"],
            text=True
        )
        nome, mem_usada, mem_total, util = out.strip().split(", ")
        return {"nome": nome, "mem_usada": int(mem_usada), "mem_total": int(mem_total), "util": int(util)}
    except Exception:
        return None

while True:
    print("\033[2J\033[H")  # limpar tela
    print("=== AgonIA Monitor ===")

    modelos = get_modelos()
    if modelos is None:
        print("❌ Ollama offline!")
    else:
        print(f"✅ Ollama online — {len(modelos)} modelos")
        for m in modelos:
            tamanho_gb = m["size"] / 1e9
            print(f"   • {m['name']:<35} {tamanho_gb:.1f} GB")

    gpu = get_gpu_info()
    if gpu:
        pct = gpu["mem_usada"] / gpu["mem_total"] * 100
        print(f"\n🎮 GPU: {gpu['nome']}")
        print(f"   VRAM: {gpu['mem_usada']}/{gpu['mem_total']} MiB ({pct:.0f}%)")
        print(f"   Utilização: {gpu['util']}%")

    time.sleep(5)
```

```bash
python3 monitor.py
```

---

## Checklist de Manutenção Semanal

```
[ ] Verificar versão do Ollama (ollama --version)
[ ] Atualizar modelos principais (ollama pull <modelo>)
[ ] Checar espaço em disco (du -sh ~/.ollama)
[ ] Revisar logs por erros (journalctl -u ollama -n 200)
[ ] Testar health check dos endpoints
[ ] Verificar se Open WebUI está atualizado
[ ] Remover modelos que não estão sendo usados
```
