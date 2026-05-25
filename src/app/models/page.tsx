'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ollama, OllamaModel } from '@/lib/ollama';
import Link from 'next/link';
import { Trash2, Download, ArrowLeft } from 'lucide-react';

const RECOMMENDED_MODELS = [
  { name: 'deepseek-coder-v2', description: 'LLM principal para código', size: '~9GB' },
  { name: 'qwen2.5-coder:7b', description: 'LLM rápido para tarefas simples', size: '~5GB' },
  { name: 'deepseek-r1:14b', description: 'Raciocínio e debugging', size: '~10GB' },
  { name: 'nomic-embed-text', description: 'Embeddings para RAG', size: '~274MB' },
  { name: 'mxbai-embed-large', description: 'Embeddings de alta qualidade', size: '~670MB' },
  { name: 'starcoder2:3b', description: 'Modelo leve para hardware limitado', size: '~2GB' },
];

export default function ModelsPage() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pulling, setPulling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modelName, setModelName] = useState('');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await ollama.listModels();
      setModels(data.models);
      setError(null);
    } catch (err) {
      setError('Falha ao conectar ao Ollama.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async (name: string) => {
    try {
      setPulling(name);
      await ollama.pullModel(name);
      await loadModels();
    } catch (err) {
      setError(`Falha ao baixar modelo ${name}`);
      console.error(err);
    } finally {
      setPulling(null);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Tem certeza que deseja remover o modelo ${name}?`)) return;
    
    try {
      setDeleting(name);
      await ollama.deleteModel(name);
      await loadModels();
    } catch (err) {
      setError(`Falha ao remover modelo ${name}`);
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb < 1 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="min-h-screen w-full">
      <div className="w-full px-4 py-8">
        <header className="mb-12 flex items-center gap-4 jarvis-fade-in">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-cyan-300 hover:bg-cyan-950/50 jarvis-border">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold jarvis-text-glow text-cyan-300 mb-2">MODEL MANAGEMENT</h1>
            <p className="text-cyan-400/60 tracking-wider">INSTALL, REMOVE AND MANAGE LLM MODELS</p>
          </div>
        </header>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500/50 jarvis-border">
            <AlertDescription className="text-red-400 uppercase">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="jarvis-border-purple jarvis-glow-purple jarvis-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-purple-300 uppercase tracking-wider">DOWNLOAD MODEL</CardTitle>
              <CardDescription className="text-purple-400/60">Enter model name or choose recommended</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-name" className="text-purple-400 uppercase">MODEL NAME</Label>
                <Input
                  id="model-name"
                  placeholder="ex: deepseek-coder-v2"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="bg-purple-950/30 border-purple-500/50 text-purple-300 placeholder-purple-400/40 uppercase"
                />
              </div>
              <Button 
                onClick={() => handlePull(modelName)}
                disabled={!modelName || pulling !== null}
                className="w-full bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-300 hover:text-purple-200 jarvis-border-purple transition-all"
              >
                {pulling ? 'DOWNLOADING...' : 'DOWNLOAD MODEL'}
              </Button>
            </CardContent>
          </Card>

          <Card className="jarvis-border-green jarvis-glow-green jarvis-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-green-300 uppercase tracking-wider">RECOMMENDED MODELS</CardTitle>
              <CardDescription className="text-green-400/60">Click to download automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {RECOMMENDED_MODELS.map((model) => (
                <div key={model.name} className="flex items-center justify-between p-4 jarvis-border-green bg-green-950/20">
                  <div>
                    <div className="text-green-300 uppercase font-medium">{model.name}</div>
                    <div className="text-green-400/60 text-sm">{model.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-400 border-green-500/50 uppercase">{model.size}</Badge>
                    <Button
                      size="sm"
                      onClick={() => handlePull(model.name)}
                      disabled={pulling !== null}
                      className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-300 hover:text-green-200 jarvis-border-green transition-all"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="jarvis-border-orange jarvis-glow-orange jarvis-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-orange-300 uppercase tracking-wider">INSTALLED MODELS</CardTitle>
            <CardDescription className="text-orange-400/60">
              {models.length} MODEL(S) INSTALLED
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-orange-400/60 uppercase">LOADING...</div>
            ) : models.length === 0 ? (
              <div className="text-center py-8 text-orange-400/60">
                <p className="uppercase mb-4">NO MODELS INSTALLED</p>
                <p className="text-sm">Download a model above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {models.map((model) => (
                  <div key={model.name} className="flex items-center justify-between p-4 jarvis-border-orange bg-orange-950/20">
                    <div className="flex-1">
                      <div className="text-orange-300 uppercase font-medium">{model.name}</div>
                      <div className="text-orange-400/60 text-sm uppercase">
                        {formatSize(model.size)} • {new Date(model.modified_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(model.name)}
                      disabled={deleting !== null}
                      className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-300 hover:text-red-200 jarvis-border transition-all"
                    >
                      {deleting === model.name ? 'REMOVING...' : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
