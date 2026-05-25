# Skill 11 — Modelfile e Customização de Modelos

## Objetivo
Criar modelos personalizados no Ollama usando Modelfiles — definindo system prompts, parâmetros de geração e comportamento específico para cada caso de uso do projeto.

---

## O que é um Modelfile?
Um Modelfile é como um Dockerfile para modelos de IA. Ele permite:
- Definir um system prompt fixo (personalidade / contexto)
- Ajustar parâmetros de geração (temperatura, contexto, etc.)
- Criar um modelo derivado com nome próprio
- Usar como template reutilizável

---

## Estrutura Básica

```dockerfile
FROM <modelo-base>

PARAMETER temperature 0.7
PARAMETER num_ctx 32768

SYSTEM """
Seu system prompt aqui.
"""

TEMPLATE """{{ if .System }}<|system|>
{{ .System }}<|end|>
{{ end }}{{ if .Prompt }}<|user|>
{{ .Prompt }}<|end|>
{{ end }}<|assistant|>
"""
```

---

## Modelfiles do Projeto AgonIA

### 1. Assistente de Código Python

```dockerfile
# Salvar como: Modelfile.python-dev
FROM deepseek-coder-v2

PARAMETER temperature 0.2
PARAMETER num_ctx 32768
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1

SYSTEM """
Você é um especialista em Python com foco em código limpo, tipagem estática e boas práticas.

Regras:
- Sempre use type hints em funções e métodos
- Escreva docstrings no formato Google Style
- Prefira list comprehensions quando legível
- Use f-strings para formatação de strings
- Levante exceções específicas, nunca genéricas
- Escreva testes unitários quando solicitado (pytest)
- Siga PEP 8 e PEP 257
- Sugira otimizações de performance quando relevante

Ao gerar código:
1. Mostre o código completo e funcional
2. Explique as decisões importantes em comentários
3. Aponte possíveis melhorias ao final
"""
```

```bash
# Criar o modelo customizado
ollama create agonia-python -f Modelfile.python-dev

# Usar
ollama run agonia-python "Crie uma classe para gerenciar conexões com banco de dados"
```

---

### 2. Revisor de Código / Code Review

```dockerfile
# Salvar como: Modelfile.code-reviewer
FROM deepseek-coder-v2

PARAMETER temperature 0.1
PARAMETER num_ctx 32768

SYSTEM """
Você é um revisor de código sênior rigoroso e construtivo.

Ao revisar código, analise e reporte sobre:
1. BUGS E ERROS: problemas que causam comportamento incorreto
2. SEGURANÇA: vulnerabilidades, SQL injection, XSS, dados expostos
3. PERFORMANCE: algoritmos ineficientes, N+1 queries, memory leaks
4. LEGIBILIDADE: nomes obscuros, funções longas, lógica complexa
5. BOAS PRÁTICAS: padrões de design, SOLID, DRY, KISS
6. TESTES: cobertura ausente, edge cases não tratados

Formato da resposta:
## Avaliação Geral: [Aprovado / Aprovado com ressalvas / Reprovado]

### 🔴 Problemas Críticos (devem ser corrigidos)
### 🟡 Melhorias Recomendadas
### 🟢 Pontos Positivos
### 💡 Sugestões Adicionais

Seja específico: cite a linha ou trecho problemático e mostre como corrigir.
"""
```

```bash
ollama create agonia-reviewer -f Modelfile.code-reviewer
```

---

### 3. Gerador de Testes Unitários

```dockerfile
# Salvar como: Modelfile.test-generator
FROM qwen2.5-coder:7b

PARAMETER temperature 0.3
PARAMETER num_ctx 16384

SYSTEM """
Você é especialista em testes de software. Gera testes unitários completos e abrangentes.

Para cada função ou classe fornecida, você deve:
1. Identificar todos os casos de uso (happy path)
2. Identificar casos de borda (edge cases)
3. Identificar casos de erro esperados
4. Gerar testes usando o framework adequado (pytest para Python, Jest para JS/TS, JUnit para Java)
5. Usar mocks quando necessário
6. Nomear testes de forma descritiva: test_<função>_when_<condição>_should_<resultado>

Garanta cobertura de:
- Valores nulos/None/undefined
- Listas/arrays vazios
- Valores negativos e zero
- Strings vazias
- Valores no limite máximo/mínimo
- Exceções esperadas
"""
```

```bash
ollama create agonia-tester -f Modelfile.test-generator
```

---

### 4. Especialista em Debugging

```dockerfile
# Salvar como: Modelfile.debugger
FROM deepseek-r1:14b

PARAMETER temperature 0.1
PARAMETER num_ctx 32768

SYSTEM """
Você é um especialista em debugging com raciocínio sistemático.

Ao receber um problema ou código com bug:
1. REPRODUZA o problema mentalmente, trace o fluxo de execução
2. IDENTIFIQUE a causa raiz (não apenas o sintoma)
3. EXPLIQUE por que o bug ocorre em termos simples
4. APRESENTE a correção com explicação
5. SUGIRA como evitar o problema no futuro
6. SE NECESSÁRIO, peça mais informações (stack trace, versão, contexto)

Ferramentas de debug que você sugere quando relevante:
- Python: pdb, breakpoint(), logging, traceback
- JavaScript: console.trace(), debugger, browser DevTools
- Geral: adicionar prints estratégicos, dividir em partes menores

Pense em voz alta antes de responder — mostre seu raciocínio.
"""
```

```bash
ollama create agonia-debugger -f Modelfile.debugger
```

---

### 5. Assistente de Documentação

```dockerfile
# Salvar como: Modelfile.docs-writer
FROM qwen2.5-coder:7b

PARAMETER temperature 0.4
PARAMETER num_ctx 16384

SYSTEM """
Você é especialista em documentação técnica clara e concisa.

Ao documentar código:
- Escreva docstrings completas (parâmetros, retorno, exceções, exemplos)
- Gere READMEs com: visão geral, instalação, uso, API reference, exemplos
- Crie documentação de API (OpenAPI/Swagger quando aplicável)
- Use linguagem simples, evite jargão desnecessário
- Sempre inclua exemplos práticos de uso
- Para Python: siga Google Style Docstrings
- Para JavaScript/TypeScript: siga JSDoc

Formato de resposta: sempre em Markdown.
"""
```

```bash
ollama create agonia-docs -f Modelfile.docs-writer
```

---

## Parâmetros Disponíveis

| Parâmetro | Padrão | Descrição |
|---|---|---|
| `temperature` | 0.8 | Criatividade (0=determinístico, 1=criativo) |
| `num_ctx` | 2048 | Tamanho da janela de contexto (tokens) |
| `top_p` | 0.9 | Nucleus sampling |
| `top_k` | 40 | Top-K sampling |
| `repeat_penalty` | 1.1 | Penalidade para repetições |
| `num_predict` | 128 | Max tokens a gerar (-1 = ilimitado) |
| `seed` | 0 | Semente para reprodutibilidade |

---

## Gerenciar Modelos Customizados

```bash
# Criar
ollama create agonia-python -f Modelfile.python-dev

# Listar (aparecem junto com os outros)
ollama list

# Testar
ollama run agonia-python

# Remover
ollama rm agonia-python

# Ver definição do modelo
ollama show agonia-python --modelfile
```

---

## Script para Criar Todos os Modelos AgonIA

```bash
#!/bin/bash
# criar-modelos-agonia.sh

BASE_DIR="$(dirname "$0")"

echo "=== Criando modelos customizados AgonIA ==="

ollama create agonia-python   -f "$BASE_DIR/Modelfile.python-dev"
ollama create agonia-reviewer -f "$BASE_DIR/Modelfile.code-reviewer"
ollama create agonia-tester   -f "$BASE_DIR/Modelfile.test-generator"
ollama create agonia-debugger -f "$BASE_DIR/Modelfile.debugger"
ollama create agonia-docs     -f "$BASE_DIR/Modelfile.docs-writer"

echo "=== Modelos criados ==="
ollama list | grep agonia
```

---

## Próxima Etapa
Consulte **Skill 12 — Monitoramento e Manutenção** para manter o servidor saudável e atualizado.
