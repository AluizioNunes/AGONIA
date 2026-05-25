# Skill 07 — Configuração do Continue.dev (VSCode / JetBrains)

## Objetivo
Configurar o plugin Continue.dev no VSCode ou JetBrains para usar o Ollama local como backend de LLM e embeddings.

---

## O que é o Continue.dev?
Continue.dev é uma extensão open-source para VSCode e JetBrains que transforma qualquer IDE em um assistant de IA para código, com suporte nativo ao Ollama.

**Site:** https://continue.dev  
**GitHub:** https://github.com/continuedev/continue

---

## Instalação

### VSCode
```
1. Abrir VSCode
2. Ir em Extensions (Ctrl+Shift+X)
3. Buscar "Continue"
4. Instalar "Continue - Codestral, Claude, and more"
```

### JetBrains (IntelliJ, PyCharm, etc.)
```
1. Settings → Plugins → Marketplace
2. Buscar "Continue"
3. Instalar e reiniciar
```

---

## Arquivo de Configuração Principal

Localização do `config.json`:

```
Windows: %USERPROFILE%\.continue\config.json
Linux:   ~/.continue/config.json
macOS:   ~/.continue/config.json
```

---

## Configuração Completa com Ollama

```json
{
  "models": [
    {
      "title": "DeepSeek Coder V2 (Local)",
      "provider": "ollama",
      "model": "deepseek-coder-v2",
      "apiBase": "http://localhost:11434",
      "contextLength": 32768
    },
    {
      "title": "Qwen2.5 Coder 7B (Local)",
      "provider": "ollama",
      "model": "qwen2.5-coder:7b",
      "apiBase": "http://localhost:11434",
      "contextLength": 32768
    },
    {
      "title": "DeepSeek R1 14B - Raciocínio",
      "provider": "ollama",
      "model": "deepseek-r1:14b",
      "apiBase": "http://localhost:11434",
      "contextLength": 32768
    }
  ],

  "tabAutocompleteModel": {
    "title": "StarCoder2 3B - Autocomplete",
    "provider": "ollama",
    "model": "starcoder2:3b",
    "apiBase": "http://localhost:11434"
  },

  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://localhost:11434"
  },

  "reranker": {
    "name": "llm",
    "params": {
      "modelTitle": "DeepSeek Coder V2 (Local)"
    }
  },

  "contextProviders": [
    { "name": "code" },
    { "name": "docs" },
    { "name": "diff" },
    { "name": "terminal" },
    { "name": "problems" },
    { "name": "folder" },
    { "name": "codebase" }
  ],

  "slashCommands": [
    {
      "name": "edit",
      "description": "Editar o código selecionado"
    },
    {
      "name": "comment",
      "description": "Adicionar comentários ao código"
    },
    {
      "name": "share",
      "description": "Exportar conversa"
    },
    {
      "name": "cmd",
      "description": "Gerar comando de terminal"
    }
  ]
}
```

---

## Configuração Mínima (Início Rápido)

Para quem quer testar rapidamente:

```json
{
  "models": [
    {
      "title": "Ollama Local",
      "provider": "ollama",
      "model": "deepseek-coder-v2",
      "apiBase": "http://localhost:11434"
    }
  ],
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://localhost:11434"
  }
}
```

---

## Atalhos do Continue.dev

| Atalho | Ação |
|---|---|
| `Ctrl+L` (ou `Cmd+L`) | Abrir chat |
| `Ctrl+Shift+L` | Adicionar seleção ao chat |
| `Ctrl+I` | Editar código selecionado inline |
| `Ctrl+Shift+R` | Refatorar seleção |
| `Ctrl+Shift+Enter` | Aceitar sugestão de autocomplete |

---

## Indexar o Codebase

Com `embeddingsProvider` configurado, o Continue.dev indexa seu projeto automaticamente:

```
1. Abrir o painel do Continue (ícone na sidebar)
2. Clicar em "Index codebase" (ou acontece automaticamente)
3. Aguardar indexação (progresso aparece na barra inferior)
```

Após indexado, você pode fazer perguntas sobre o projeto:
```
@codebase Como a autenticação está implementada neste projeto?
@codebase Quais funções lidam com banco de dados?
@codebase Existe algum padrão de tratamento de erros?
```

---

## Adicionar Documentação Customizada

```json
{
  "docs": [
    {
      "title": "Documentação Interna",
      "startUrl": "http://localhost:3001/docs",
      "rootUrl": "http://localhost:3001"
    },
    {
      "title": "FastAPI Docs",
      "startUrl": "https://fastapi.tiangolo.com"
    }
  ]
}
```

---

## Servidor em Outra Máquina

Se o Ollama estiver em um servidor remoto na rede local:

```json
{
  "models": [
    {
      "title": "Servidor IA Local",
      "provider": "ollama",
      "model": "deepseek-coder-v2",
      "apiBase": "http://192.168.1.100:11434"
    }
  ],
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://192.168.1.100:11434"
  }
}
```

Substitua `192.168.1.100` pelo IP real do servidor.  
Veja **Skill 08 — Acesso Rede Local** para configurar o Ollama para aceitar conexões externas.

---

## Troubleshooting

### Autocomplete não funciona
```bash
# Verificar se o modelo de autocomplete está instalado
ollama list | grep starcoder2

# Instalar se necessário
ollama pull starcoder2:3b
```

### Indexação falha
```bash
# Verificar se o modelo de embedding está instalado
ollama list | grep nomic-embed-text

# Instalar se necessário
ollama pull nomic-embed-text
```

### Logs do Continue.dev
```
VSCode: View → Output → selecionar "Continue" no dropdown
```

---

## Próxima Etapa
Consulte **Skill 08 — Acesso Rede Local** para expor o servidor Ollama para outras máquinas da rede.
