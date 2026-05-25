# Skill 10 — Embeddings e RAG (Retrieval-Augmented Generation)

## Objetivo
Criar pipelines de busca semântica e RAG usando os modelos de embedding do Ollama com bancos de vetores locais.

---

## Conceito RAG

```
[Documentos / Codebase]
        ↓
   Embedding Model (nomic-embed-text)
        ↓
   Banco de Vetores (ChromaDB / Qdrant)
        ↓
[Pergunta do usuário] → Embedding → Busca similaridade
        ↓
   Contexto relevante + LLM (deepseek-coder-v2)
        ↓
   Resposta com base nos seus documentos
```

---

## Dependências Python

```bash
pip install openai chromadb numpy python-dotenv
```

---

## Exemplo 1: RAG Simples com ChromaDB

```python
# rag_simples.py
import chromadb
from openai import OpenAI

# Configurar cliente Ollama
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)

EMBED_MODEL = "nomic-embed-text"
LLM_MODEL   = "deepseek-coder-v2"

def get_embedding(text: str) -> list[float]:
    response = client.embeddings.create(model=EMBED_MODEL, input=text)
    return response.data[0].embedding

def get_completion(prompt: str, context: str) -> str:
    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": f"Responda com base neste contexto:\n\n{context}"
            },
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

# Configurar ChromaDB local
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(
    name="documentos",
    metadata={"hnsw:space": "cosine"}
)

# Indexar documentos
def indexar_documentos(docs: list[dict]):
    """
    docs: [{"id": "1", "texto": "...", "metadados": {...}}]
    """
    for doc in docs:
        embedding = get_embedding(doc["texto"])
        collection.add(
            ids=[doc["id"]],
            embeddings=[embedding],
            documents=[doc["texto"]],
            metadatas=[doc.get("metadados", {})]
        )
    print(f"{len(docs)} documentos indexados.")

# Buscar e responder
def perguntar(pergunta: str, n_resultados: int = 3) -> str:
    emb_pergunta = get_embedding(pergunta)
    resultados = collection.query(
        query_embeddings=[emb_pergunta],
        n_results=n_resultados
    )
    contexto = "\n\n---\n\n".join(resultados["documents"][0])
    return get_completion(pergunta, contexto)


# Exemplo de uso
if __name__ == "__main__":
    # Indexar documentos de exemplo
    documentos = [
        {
            "id": "doc1",
            "texto": "A função authenticate() recebe username e password, verifica no banco e retorna um JWT token com validade de 24h.",
            "metadados": {"arquivo": "auth.py", "linha": 42}
        },
        {
            "id": "doc2",
            "texto": "O endpoint /api/users aceita GET para listar usuários e POST para criar. Requer autenticação Bearer token.",
            "metadados": {"arquivo": "routes.py", "linha": 15}
        },
        {
            "id": "doc3",
            "texto": "O banco de dados usa PostgreSQL com SQLAlchemy. A string de conexão está em DATABASE_URL no .env.",
            "metadados": {"arquivo": "database.py", "linha": 8}
        }
    ]
    indexar_documentos(documentos)

    # Fazer uma pergunta
    resposta = perguntar("Como funciona a autenticação no sistema?")
    print(resposta)
```

---

## Exemplo 2: Indexar Codebase Inteiro

```python
# indexar_projeto.py
import os
import hashlib
import chromadb
from openai import OpenAI
from pathlib import Path

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
chroma = chromadb.PersistentClient(path="./chroma_db")
collection = chroma.get_or_create_collection("codebase", metadata={"hnsw:space": "cosine"})

EXTENSOES = {".py", ".js", ".ts", ".go", ".java", ".cs", ".cpp", ".rs", ".rb"}
IGNORAR   = {"node_modules", ".git", "__pycache__", ".venv", "dist", "build"}

def chunkar_arquivo(caminho: str, chunk_size: int = 500) -> list[str]:
    """Divide arquivo em chunks por linhas."""
    with open(caminho, "r", encoding="utf-8", errors="ignore") as f:
        linhas = f.readlines()
    chunks = []
    for i in range(0, len(linhas), chunk_size):
        chunk = "".join(linhas[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks

def indexar_projeto(diretorio: str):
    projeto = Path(diretorio)
    total = 0

    for arquivo in projeto.rglob("*"):
        if arquivo.suffix not in EXTENSOES:
            continue
        if any(p in arquivo.parts for p in IGNORAR):
            continue

        chunks = chunkar_arquivo(str(arquivo))
        for i, chunk in enumerate(chunks):
            doc_id = hashlib.md5(f"{arquivo}:{i}".encode()).hexdigest()

            # Evitar re-indexar
            existente = collection.get(ids=[doc_id])
            if existente["ids"]:
                continue

            emb = client.embeddings.create(model="nomic-embed-text", input=chunk)
            collection.add(
                ids=[doc_id],
                embeddings=[emb.data[0].embedding],
                documents=[chunk],
                metadatas=[{"arquivo": str(arquivo.relative_to(projeto)), "chunk": i}]
            )
            total += 1

    print(f"Indexados {total} chunks.")

# Executar:
# indexar_projeto("/caminho/do/seu/projeto")
```

---

## Exemplo 3: Pipeline RAG com Qdrant

```bash
# Instalar Qdrant via Docker
docker run -d -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

```python
# rag_qdrant.py
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from openai import OpenAI
import uuid

client  = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
qdrant  = QdrantClient(host="localhost", port=6333)

COLLECTION = "agonia_docs"
DIMS       = 768  # nomic-embed-text produz 768 dimensões

# Criar coleção (apenas uma vez)
qdrant.recreate_collection(
    collection_name=COLLECTION,
    vectors_config=VectorParams(size=DIMS, distance=Distance.COSINE)
)

def adicionar_documento(texto: str, metadados: dict = {}):
    emb = client.embeddings.create(model="nomic-embed-text", input=texto)
    qdrant.upsert(
        collection_name=COLLECTION,
        points=[PointStruct(
            id=str(uuid.uuid4()),
            vector=emb.data[0].embedding,
            payload={"texto": texto, **metadados}
        )]
    )

def buscar(pergunta: str, top_k: int = 5) -> list[dict]:
    emb = client.embeddings.create(model="nomic-embed-text", input=pergunta)
    resultados = qdrant.search(
        collection_name=COLLECTION,
        query_vector=emb.data[0].embedding,
        limit=top_k
    )
    return [r.payload for r in resultados]
```

---

## Dimensões dos Modelos de Embedding

| Modelo | Dimensões | Tamanho Índice (10K docs) |
|---|---|---|
| all-minilm | 384 | ~15 MB |
| nomic-embed-text | 768 | ~30 MB |
| mxbai-embed-large | 1024 | ~40 MB |
| snowflake-arctic-embed | 1024 | ~40 MB |

---

## Próxima Etapa
Consulte **Skill 11 — Modelfile e Customização** para criar versões personalizadas dos modelos com instruções e parâmetros específicos.
