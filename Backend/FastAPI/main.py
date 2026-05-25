from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import httpx
from pydantic import BaseModel
from typing import List, Optional
import os

# Modelos
class ChatRequest(BaseModel):
    model: str
    messages: List[dict]
    stream: bool = False

class ModelInfo(BaseModel):
    name: str
    size: int
    modified_at: str

class PullModelRequest(BaseModel):
    model: str

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.ollama_url = os.getenv("OLLAMA_URL", "http://ollama:11434")
    yield
    # Shutdown
    pass

# App
app = FastAPI(
    title="AgonIA FastAPI Backend",
    description="Backend híbrido para gerenciamento de modelos LLM",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "backend": "fastapi"}

# Listar Modelos
@app.get("/api/models", response_model=List[ModelInfo])
async def list_models():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{app.state.ollama_url}/api/tags")
            response.raise_for_status()
            data = response.json()
            return data.get("models", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{app.state.ollama_url}/api/chat",
                json=request.dict()
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Generate
@app.post("/api/generate")
async def generate(request: ChatRequest):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{app.state.ollama_url}/api/generate",
                json=request.dict()
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Baixar Modelo Customizado
@app.post("/api/models/pull")
async def pull_model(request: PullModelRequest):
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{app.state.ollama_url}/api/pull",
                json={"name": request.model, "stream": False}
            )
            response.raise_for_status()
            return {"status": "success", "model": request.model}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
