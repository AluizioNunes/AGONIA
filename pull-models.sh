#!/bin/bash
# Script para baixar modelos Ollama após deploy
# Execute no servidor: docker exec agonia-ollama bash -c "$(cat pull-models.sh)"

set -e

echo "=== Baixando Modelos LLM para Código ==="
ollama pull deepseek-coder-v2
ollama pull qwen2.5-coder:7b

echo "=== Baixando Modelos de Embedding ==="
ollama pull nomic-embed-text
ollama pull mxbai-embed-large

echo "=== Baixando Modelos Adicionais ==="
ollama pull deepseek-r1:14b
ollama pull starcoder2:3b

echo "=== Modelos Instalados ==="
ollama list

echo "=== Concluído ==="
