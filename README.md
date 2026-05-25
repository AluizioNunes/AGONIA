# AgonIA — Repositório Local de Motores de IA

## Visão Geral

AgonIA é um servidor local de modelos LLM e Embeddings baseado em **Ollama**, expondo uma API compatível com OpenAI para uso em ferramentas de desenvolvimento como Cursor, TRAE e Continue.dev.

```
[Cursor / TRAE / Continue.dev / VSCode]
            ↓  HTTP (OpenAI API format)
    http://<servidor>:11434/v1
            ↓
         OLLAMA
    (servidor de modelos)
            ↓
  GPU/CPU local — 100% privado
```

---

## Índice de Skills (Ordem de Execução)

| # | Skill | O que faz | Quando usar |
|---|---|---|---|
| 01 | [Instalação do Ollama](./Skills/01-instalacao-ollama/SKILL.md) | Instalar Ollama no servidor | Primeiro passo obrigatório |
| 02 | [Gestão de Modelos](./Skills/02-gestao-modelos/SKILL.md) | Pull, list, rm, update de modelos | Toda vez que gerenciar modelos |
| 03 | [Modelos LLM para Código](./Skills/03-modelos-llm-codigo/SKILL.md) | Escolher modelo certo por hardware | Antes de instalar modelos |
| 04 | [Modelos de Embeddings](./Skills/04-modelos-embeddings/SKILL.md) | Instalar e usar modelos de embedding | Para RAG e busca semântica |
| 05 | [Configuração Cursor](./Skills/05-configuracao-cursor/SKILL.md) | Conectar Cursor ao Ollama local | Ao configurar o IDE Cursor |
| 06 | [Configuração TRAE](./Skills/06-configuracao-trae/SKILL.md) | Conectar TRAE ao Ollama local | Ao configurar o IDE TRAE |
| 07 | [Configuração Continue.dev](./Skills/07-configuracao-continue/SKILL.md) | Plugin VSCode/JetBrains com Ollama | Para usar VSCode com IA local |
| 08 | [Acesso Rede Local](./Skills/08-acesso-rede-local/SKILL.md) | Expor Ollama para a rede local | PC dev diferente do servidor |
| 09 | [Open WebUI](./Skills/09-open-webui/SKILL.md) | Interface gráfica de gerenciamento | Para painel web de controle |
| 10 | [Embeddings e RAG](./Skills/10-embeddings-rag/SKILL.md) | Pipelines de busca semântica | Para RAG sobre codebase/docs |
| 11 | [Modelfile e Customização](./Skills/11-modelfile-customizacao/SKILL.md) | Criar modelos com system prompts | Para personalizar comportamento |
| 12 | [Monitoramento e Manutenção](./Skills/12-monitoramento-manutencao/SKILL.md) | Saúde, logs, updates | Operação contínua do servidor |

---

## Stack do Projeto

| Componente | Tecnologia | Porta |
|---|---|---|
| Servidor de modelos | Ollama | 11434 |
| Interface web | Open WebUI | 3000 |
| Banco de vetores | ChromaDB / Qdrant | 6333 |
| IDE principal | Cursor / TRAE | — |
| Plugin VSCode | Continue.dev | — |

---

## Modelos Recomendados

### LLM para Código
- `deepseek-coder-v2` — uso geral (requer ~9GB VRAM)
- `qwen2.5-coder:7b` — GPUs menores (5GB VRAM)
- `deepseek-r1:14b` — raciocínio e debugging

### Embeddings
- `nomic-embed-text` — padrão para RAG

### Modelos Customizados AgonIA
- `agonia-python` — especialista Python
- `agonia-reviewer` — code review
- `agonia-tester` — geração de testes
- `agonia-debugger` — debugging com raciocínio
- `agonia-docs` — documentação técnica

---

## Início Rápido

### Opção A: Deploy em Servidor Remoto (Docker Compose)

Recomendado para produção. Veja [DEPLOY.md](./DEPLOY.md) para instruções detalhadas.

```bash
# 1. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env conforme necessário

# 2. Deploy automático para servidor remoto
chmod +x deploy.sh
./deploy.sh usuario@seu-servidor.com

# 3. Acessar frontend
# Open WebUI: http://seu-servidor:3000
```

### Opção B: Instalação Local

```bash
# 1. Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Instalar modelos essenciais
ollama pull qwen2.5-coder:7b
ollama pull nomic-embed-text

# 3. Verificar API
curl http://localhost:11434/v1/models

# 4. Configurar Cursor / TRAE:
#    Base URL: http://localhost:11434/v1
#    API Key:  ollama
#    Model:    qwen2.5-coder:7b
```

---

## Arquitetura Docker

A stack Docker Compose inclui:

- **ollama**: Servidor de modelos LLM (porta 11434)
- **open-webui**: Interface web frontend (porta 3000)
- **qdrant**: Banco de vetores para RAG (porta 6333)
- **nginx**: Reverse proxy para produção (portas 80/443) - opcional

Veja [docker-compose.yml](./docker-compose.yml) para configuração completa.
