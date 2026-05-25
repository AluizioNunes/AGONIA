# Skill 03 — Modelos LLM para Código

## Objetivo
Escolher e instalar os melhores modelos de linguagem para geração, revisão e explicação de código conforme o hardware disponível.

---

## Tabela de Modelos por Hardware

| Modelo | Parâmetros | VRAM Mín. | RAM (CPU) | Qualidade | Velocidade |
|---|---|---|---|---|---|
| starcoder2:3b | 3B | 2 GB | 6 GB | ⭐⭐ | ⚡⚡⚡⚡ |
| qwen2.5-coder:7b | 7B | 5 GB | 10 GB | ⭐⭐⭐ | ⚡⚡⚡ |
| deepseek-coder-v2 | 16B | 9 GB | 20 GB | ⭐⭐⭐⭐ | ⚡⚡ |
| qwen2.5-coder:32b | 32B | 20 GB | 40 GB | ⭐⭐⭐⭐⭐ | ⚡ |
| deepseek-r1:14b | 14B | 10 GB | 24 GB | ⭐⭐⭐⭐ (raciocínio) | ⚡⚡ |
| codellama:13b | 13B | 8 GB | 16 GB | ⭐⭐⭐ | ⚡⚡ |

---

## Modelos por Cenário

### Cenário A: GPU com 4-6 GB VRAM (RTX 3050/3060/4060)
```bash
ollama pull qwen2.5-coder:7b    # principal
ollama pull starcoder2:3b        # fallback rápido
```

### Cenário B: GPU com 8-12 GB VRAM (RTX 3070/3080/4070)
```bash
ollama pull deepseek-coder-v2   # principal — melhor custo/benefício
ollama pull qwen2.5-coder:7b    # tarefas rápidas
```

### Cenário C: GPU com 20-24 GB VRAM (RTX 3090/4090 / A5000)
```bash
ollama pull qwen2.5-coder:32b   # qualidade próxima ao GPT-4
ollama pull deepseek-r1:14b     # tarefas de raciocínio complexo
```

### Cenário D: Apenas CPU (sem GPU dedicada)
```bash
ollama pull starcoder2:3b        # único viável em CPU com boa velocidade
ollama pull qwen2.5-coder:7b    # funciona, mas lento (1-3 tok/s)
```

---

## Detalhes dos Modelos

### Qwen2.5 Coder 7B — `qwen2.5-coder:7b`
- **Criador:** Alibaba
- **Melhor para:** Completions rápidas, refatoração, debugging
- **Linguagens fortes:** Python, JavaScript, TypeScript, Go, Java, C++
- **Contexto:** 32K tokens
- **Instalação:**
```bash
ollama pull qwen2.5-coder:7b
```

### DeepSeek Coder V2 — `deepseek-coder-v2`
- **Criador:** DeepSeek AI
- **Melhor para:** Geração de código completo, explicações, arquitetura
- **Linguagens fortes:** Todas as linguagens mainstream
- **Contexto:** 128K tokens
- **Instalação:**
```bash
ollama pull deepseek-coder-v2
```

### Qwen2.5 Coder 32B — `qwen2.5-coder:32b`
- **Criador:** Alibaba
- **Melhor para:** Tarefas complexas, geração de código de produção
- **Contexto:** 128K tokens
- **Nota:** Requer GPU high-end ou múltiplas GPUs
- **Instalação:**
```bash
ollama pull qwen2.5-coder:32b
```

### DeepSeek R1 14B — `deepseek-r1:14b`
- **Criador:** DeepSeek AI
- **Melhor para:** Raciocínio passo-a-passo, algoritmos complexos, debugging
- **Diferencial:** Modelo de raciocínio encadeado (Chain-of-Thought nativo)
- **Contexto:** 64K tokens
- **Instalação:**
```bash
ollama pull deepseek-r1:14b
```

### CodeLlama 13B — `codellama:13b`
- **Criador:** Meta
- **Melhor para:** Fill-in-the-middle, completions tradicionais
- **Variantes disponíveis:**
```bash
ollama pull codellama:13b        # geral
ollama pull codellama:13b-python # especializado em Python
ollama pull codellama:13b-instruct  # instrução/chat
```

### StarCoder2 3B — `starcoder2:3b`
- **Criador:** BigCode / HuggingFace
- **Melhor para:** Máquinas com recursos limitados, uso em CPU
- **Contexto:** 16K tokens
- **Instalação:**
```bash
ollama pull starcoder2:3b
```

---

## Testar Qualidade dos Modelos

```bash
# Teste de geração de código
ollama run qwen2.5-coder:7b "Implemente uma classe Stack em Python com os métodos push, pop, peek e is_empty. Inclua docstrings e type hints."

# Teste de debugging
ollama run deepseek-coder-v2 "Este código Python tem um bug: def soma(a, b): return a - b. Encontre e corrija."

# Teste de explicação
ollama run deepseek-r1:14b "Explique passo a passo como funciona o algoritmo QuickSort e qual sua complexidade."
```

---

## Benchmarks de Referência (Tokens por Segundo)

> Medições aproximadas em hardware de referência.

| Modelo | RTX 4090 (24GB) | RTX 4060 (8GB) | CPU i7-12gen |
|---|---|---|---|
| starcoder2:3b | ~90 tok/s | ~60 tok/s | ~8 tok/s |
| qwen2.5-coder:7b | ~65 tok/s | ~35 tok/s | ~3 tok/s |
| deepseek-coder-v2 | ~40 tok/s | N/A (VRAM) | N/A |
| qwen2.5-coder:32b | ~18 tok/s | N/A (VRAM) | N/A |

---

## Próxima Etapa
Consulte **Skill 04 — Modelos de Embeddings** para escolher modelos para busca semântica e RAG.
