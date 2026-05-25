#!/bin/bash
# criar-modelos-agonia.sh
# Cria todos os modelos customizados AgonIA

BASE_DIR="$(dirname "$0")"

echo "=== Criando modelos customizados AgonIA ==="

ollama create agonia-python   -f "$BASE_DIR/Modelfile.python-dev"
ollama create agonia-reviewer -f "$BASE_DIR/Modelfile.code-reviewer"
ollama create agonia-tester   -f "$BASE_DIR/Modelfile.test-generator"
ollama create agonia-debugger -f "$BASE_DIR/Modelfile.debugger"
ollama create agonia-docs     -f "$BASE_DIR/Modelfile.docs-writer"

echo "=== Modelos criados ==="
ollama list | grep agonia
