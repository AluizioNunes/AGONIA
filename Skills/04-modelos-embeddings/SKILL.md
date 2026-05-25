# Skill 04 — Modelos de Embeddings

## Objetivo
Instalar e usar modelos de embedding para geração de vetores semânticos, busca em código, RAG (Retrieval-Augmented Generation) e indexação de documentos.

---

## O que são Embeddings?
Embeddings convertem texto (código, documentos, perguntas) em vetores numéricos de alta dimensão. Textos semanticamente similares ficam próximos no espaço vetorial, permitindo busca por similaridade.

**Uso no projeto:**
- Indexar codebase para busca semântica (Continue.dev)
- RAG sobre documentação técnica
- Comparação de trechos de código similares
- Memória semântica para agentes de IA

---

## Tabela de Modelos de Embedding

| Modelo | Dimensões | Tamanho | Velocidade | Qualidade |
|---|---|---|---|---|
| all-minilm | 384 | 46 MB | ⚡⚡⚡⚡⚡ | ⭐⭐ |
| nomic-embed-text | 768 | 274 MB | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ |
| mxbai-embed-large | 1024 | 670 MB | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| snowflake-arctic-embed | 1024 | 670 MB | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| nomic-embed-text:v1.5 | 768 | 274 MB | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ |

---

## Instalação

```bash
# Recomendado para desenvolvimento (equilíbrio qualidade/velocidade)
ollama pull nomic-embed-text

# Máxima qualidade (para produção)
ollama pull mxbai-embed-large

# Ultra leve (para máquinas com pouco recurso)
ollama pull all-minilm

# Otimizado para busca/retrieval
ollama pull snowflake-arctic-embed
```

---

## Uso via API

### Gerar embedding de um texto
```bash
curl http://localhost:11434/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ollama" \
  -d '{
    "model": "nomic-embed-text",
    "input": "função para calcular fibonacci recursivo"
  }'
```

### Resposta esperada
```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [0.021, -0.034, 0.112, ...],
      "index": 0
    }
  ],
  "model": "nomic-embed-text",
  "usage": { "prompt_tokens": 8, "total_tokens": 8 }
}
```

### Múltiplos inputs em batch
```bash
curl http://localhost:11434/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ollama" \
  -d '{
    "model": "nomic-embed-text",
    "input": [
      "função de ordenação",
      "algoritmo de busca",
      "estrutura de dados árvore"
    ]
  }'
```

---

## Uso com Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)

# Gerar embedding
response = client.embeddings.create(
    model="nomic-embed-text",
    input="Implemente uma função de busca binária"
)

vector = response.data[0].embedding
print(f"Dimensões: {len(vector)}")
print(f"Primeiros 5 valores: {vector[:5]}")
```

---

## Calcular Similaridade entre Textos

```python
import numpy as np
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

def get_embedding(text: str, model: str = "nomic-embed-text") -> list[float]:
    response = client.embeddings.create(model=model, input=text)
    return response.data[0].embedding

def cosine_similarity(vec_a: list, vec_b: list) -> float:
    a = np.array(vec_a)
    b = np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# Exemplo
query     = "como ordenar uma lista em Python"
snippet_1 = "def bubble_sort(arr): ..."
snippet_2 = "import requests  # faz requisições HTTP"

emb_query = get_embedding(query)
emb_s1    = get_embedding(snippet_1)
emb_s2    = get_embedding(snippet_2)

print(f"Similaridade com snippet 1: {cosine_similarity(emb_query, emb_s1):.4f}")
print(f"Similaridade com snippet 2: {cosine_similarity(emb_query, emb_s2):.4f}")
# snippet 1 terá similaridade muito maior
```

---

## Uso com Continue.dev (VSCode)

No arquivo `~/.continue/config.json`:

```json
{
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://localhost:11434"
  }
}
```

O Continue.dev usará automaticamente os embeddings para indexar seu projeto e responder perguntas sobre o codebase.

---

## Banco de Vetores Recomendados

Para persistir embeddings em produção:

| Banco | Tipo | Caso de Uso |
|---|---|---|
| ChromaDB | Local / embarcado | Projetos pequenos/médios |
| Qdrant | Self-hosted / Docker | Produção, alta performance |
| Weaviate | Self-hosted / Cloud | Projetos complexos |
| FAISS | Biblioteca Python | Pesquisa, sem servidor |
| pgvector | Extensão PostgreSQL | Já usa PostgreSQL |

```bash
# Instalar ChromaDB (mais simples para começar)
pip install chromadb

# Qdrant via Docker
docker run -p 6333:6333 qdrant/qdrant
```

---

## Próxima Etapa
Consulte **Skill 05 — Configuração do Cursor** para integrar os modelos instalados ao seu IDE de desenvolvimento.
