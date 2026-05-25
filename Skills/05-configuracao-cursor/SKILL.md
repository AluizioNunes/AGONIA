# Skill 05 — Configuração do Cursor IDE

## Objetivo
Configurar o Cursor IDE para consumir os modelos LLM do servidor Ollama local em vez de APIs pagas na nuvem.

---

## Pré-requisitos
- Ollama instalado e rodando (Skill 01)
- Pelo menos um modelo LLM instalado (Skill 03)
- Cursor IDE instalado: https://cursor.sh

---

## Método 1 — Configuração pela Interface Gráfica

### Passo 1: Abrir configurações de modelos
```
Cursor → Settings (Ctrl+Shift+J ou Cmd+,) → Models
```

### Passo 2: Adicionar modelo customizado
- Clique em **"+ Add Model"**
- Ou role até a seção **"OpenAI API Key"** e clique em **"Override OpenAI Base URL"**

### Passo 3: Preencher as configurações

| Campo | Valor |
|---|---|
| OpenAI Base URL | `http://localhost:11434/v1` |
| OpenAI API Key | `ollama` (qualquer valor) |
| Model Name | `deepseek-coder-v2` (ou o modelo desejado) |

> **Se Cursor e servidor estiverem em máquinas diferentes:**
> Substitua `localhost` pelo IP do servidor: `http://192.168.1.100:11434/v1`

### Passo 4: Selecionar o modelo
- No painel de chat do Cursor, clique no seletor de modelo
- Escolha o modelo que você acabou de adicionar

---

## Método 2 — Editar arquivo de configuração diretamente

Localize o arquivo de configuração do Cursor:

```
Windows: %APPDATA%\Cursor\User\settings.json
Linux:   ~/.config/Cursor/User/settings.json
macOS:   ~/Library/Application Support/Cursor/User/settings.json
```

Adicione ou edite:

```json
{
  "cursor.general.openAIApiKey": "ollama",
  "cursor.general.openAIBaseUrl": "http://localhost:11434/v1",
  "cursor.general.customModels": [
    {
      "name": "deepseek-coder-v2",
      "enabled": true
    },
    {
      "name": "qwen2.5-coder:7b",
      "enabled": true
    }
  ]
}
```

---

## Configurações por Funcionalidade

### Chat (Ctrl+L)
Usa o modelo principal configurado. Ideal para:
- Fazer perguntas sobre o código
- Gerar funções completas
- Explicações de algoritmos

**Modelo recomendado:** `deepseek-coder-v2` ou `qwen2.5-coder:32b`

### Autocomplete (inline suggestions)
> ⚠️ **Limitação:** O Cursor usa seu próprio modelo para autocomplete em tempo real (não configurável para Ollama local). Apenas o Chat e o Composer são configuráveis.

### Composer (Ctrl+I)
Edição multi-arquivo com contexto. Usa o modelo configurado.

**Modelo recomendado:** `qwen2.5-coder:32b` para máxima qualidade

---

## Adicionar Múltiplos Modelos

Você pode alternar entre modelos no chat. Adicione todos:

```
Modelos para adicionar no Cursor:
- deepseek-coder-v2      → tarefas gerais de código
- qwen2.5-coder:7b       → respostas rápidas
- deepseek-r1:14b        → debugging e raciocínio
- qwen2.5-coder:32b      → código complexo (se GPU permitir)
```

---

## Usar com Codebase Indexado

No Cursor, ative **"Include project context"** no chat para que ele analise seu projeto. O Cursor usa seus próprios embeddings para isso — para embeddings locais via Ollama, use o Continue.dev (Skill 07).

---

## Testar a Integração

Abra qualquer arquivo de código no Cursor e no Chat (Ctrl+L) envie:

```
Explique o que este arquivo faz em 3 pontos principais.
```

Se a resposta vier com o modelo Ollama (sem cobrar créditos), a integração está funcionando.

---

## Troubleshooting

### Erro: "Connection refused"
```bash
# Verificar se Ollama está rodando
curl http://localhost:11434/api/tags

# Iniciar se necessário
ollama serve
```

### Erro: "Model not found"
```bash
# Verificar modelos instalados
ollama list

# Instalar o modelo desejado
ollama pull deepseek-coder-v2
```

### Resposta lenta
- Verifique se a GPU está sendo usada: `nvidia-smi` durante uma requisição
- Se apenas CPU: considere um modelo menor (starcoder2:3b ou qwen2.5-coder:7b)

### Cursor em outra máquina não conecta
- Verifique Skill 08 (Acesso Rede Local) para liberar o Ollama externamente
- Substitua `localhost` pelo IP do servidor nas configurações

---

## Próxima Etapa
Consulte **Skill 06 — Configuração do TRAE** para configurar o outro IDE.
