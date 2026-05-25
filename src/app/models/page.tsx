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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Modelos</h1>
            <p className="text-slate-400">Instale, remova e gerencie modelos LLM</p>
          </div>
        </header>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-800">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Baixar Modelo</CardTitle>
              <CardDescription className="text-slate-400">Digite o nome do modelo ou escolha um recomendado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-name" className="text-slate-300">Nome do Modelo</Label>
                <Input
                  id="model-name"
                  placeholder="ex: deepseek-coder-v2"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button 
                onClick={() => handlePull(modelName)}
                disabled={!modelName || pulling !== null}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {pulling ? 'Baixando...' : 'Baixar Modelo'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Modelos Recomendados</CardTitle>
              <CardDescription className="text-slate-400">Clique para baixar automaticamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {RECOMMENDED_MODELS.map((model) => (
                <div key={model.name} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{model.name}</div>
                    <div className="text-slate-400 text-sm">{model.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-slate-300 border-slate-500">{model.size}</Badge>
                    <Button
                      size="sm"
                      onClick={() => handlePull(model.name)}
                      disabled={pulling !== null}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Modelos Instalados</CardTitle>
            <CardDescription className="text-slate-400">
              {models.length} modelo(s) instalado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">Carregando...</div>
            ) : models.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Nenhum modelo instalado. Baixe um modelo acima para começar.
              </div>
            ) : (
              <div className="space-y-3">
                {models.map((model) => (
                  <div key={model.name} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-medium">{model.name}</div>
                      <div className="text-slate-400 text-sm">
                        {formatSize(model.size)} • {new Date(model.modified_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(model.name)}
                      disabled={deleting !== null}
                    >
                      {deleting === model.name ? 'Removendo...' : <Trash2 className="h-4 w-4" />}
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
