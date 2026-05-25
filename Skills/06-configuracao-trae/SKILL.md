# Skill 06 — Configuração do TRAE IDE

## Objetivo
Configurar o TRAE IDE (ByteDance) para consumir os modelos LLM do servidor Ollama local.

---

## Pré-requisitos
- Ollama instalado e rodando (Skill 01)
- Pelo menos um modelo LLM instalado (Skill 03)
- TRAE IDE instalado: https://www.trae.ai

---

## Configuração do Modelo Customizado

### Passo 1: Abrir configurações de IA
```
TRAE → Settings (engrenagem) → AI → Models
```

### Passo 2: Adicionar provider customizado
- Clique em **"+ Add Model"** ou **"Custom Provider"**
- Selecione **"OpenAI Compatible"** como tipo de provider

### Passo 3: Preencher as configurações

| Campo | Valor |
|---|---|
| Provider Name | `Ollama Local` |
| API Endpoint | `http://localhost:11434/v1` |
| API Key | `ollama` |
| Model ID | `deepseek-coder-v2` |

> **Se TRAE e servidor estiverem em máquinas diferentes:**
> Use o IP do servidor: `http://192.168.1.100:11434/v1`

### Passo 4: Verificar conexão
- Clique em **"Test Connection"** (se disponível)
- Ou abra o chat e envie uma mensagem de teste

---

## Configuração via Arquivo (se suportado)

Localize o diretório de configuração do TRAE:

```
Windows: %APPDATA%\trae\
Linux:   ~/.config/trae/
macOS:   ~/Library/Application Support/trae/
```

Arquivo de configuração de modelos (exemplo):

```json
{
  "aiProviders": [
    {
      "id": "ollama-local",
      "name": "Ollama Local",
      "type": "openai-compatible",
      "baseUrl": "http://localhost:11434/v1",
      "apiKey": "ollama",
      "models": [
        {
          "id": "deepseek-coder-v2",
          "name": "DeepSeek Coder V2 (Local)",
          "capabilities": ["chat", "code"]
        },
        {
          "id": "qwen2.5-coder:7b",
          "name": "Qwen2.5 Coder 7B (Local)",
          "capabilities": ["chat", "code"]
        }
      ]
    }
  ],
  "defaultProvider": "ollama-local",
  "defaultModel": "deepseek-coder-v2"
}
```

---

## Funcionalidades do TRAE com Ollama

### Chat de código
Funciona completamente com Ollama. Envie perguntas, peça explicações e refatorações.

### AI Edit (edição inline)
Selecione um trecho de código → clique em **"AI Edit"** → o modelo Ollama processa localmente.

### Geração de código
Use o atalho de geração (geralmente `Ctrl+K` ou `Cmd+K`) e o modelo local responderá.

---

## Modelos Recomendados para TRAE

```
Para tarefas gerais e chat:
→ deepseek-coder-v2

Para respostas mais rápidas:
→ qwen2.5-coder:7b

Para raciocínio e debugging complexo:
→ deepseek-r1:14b

Se GPU >= 20GB VRAM:
→ qwen2.5-coder:32b
```

---

## Testar a Integração

Abra um arquivo de código qualquer e no AI Chat envie:

```
Liste os 3 pontos mais importantes de melhoria que você vê neste código.
```

A resposta deve vir do modelo local (sem consumir créditos da conta TRAE).

---

## Usar Múltiplos Modelos no TRAE

Adicione todos os modelos que você instalou e alterne conforme a tarefa:

```
Modelos para cadastrar:
1. deepseek-coder-v2       → uso geral (padrão)
2. qwen2.5-coder:7b        → respostas rápidas / autocomplete
3. deepseek-r1:14b         → análise e raciocínio
4. qwen2.5-coder:32b       → código crítico de produção
```

---

## Troubleshooting

### TRAE não conecta ao Ollama

```bash
# 1. Verificar se Ollama está respondendo
curl http://localhost:11434/v1/models

# 2. Verificar se o modelo está instalado
ollama list

# 3. Testar endpoint manualmente
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ollama" \
  -d '{"model":"deepseek-coder-v2","messages":[{"role":"user","content":"oi"}]}'
```

### Modelo não aparece na lista do TRAE
- O TRAE pode não chamar `/v1/models` automaticamente
- Adicione o modelo manualmente pelo nome exato (ex: `qwen2.5-coder:7b`)
- Verifique o nome exato com `ollama list`

### Timeout nas respostas
- Modelos grandes (32B+) podem demorar em hardware limitado
- Use um modelo menor para uso no dia a dia
- Aumente o timeout nas configurações do TRAE se disponível

---

## Observação sobre Versões do TRAE
O TRAE está em desenvolvimento ativo. A localização exata dos menus pode variar entre versões. Se as opções não estiverem onde indicado, procure por "Custom Model", "OpenAI Compatible" ou "API Settings" nas configurações de IA.

---

## Próxima Etapa
Consulte **Skill 07 — Configuração do Continue.dev** para integrar o VSCode com Ollama.
