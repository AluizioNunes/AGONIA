'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ollama, OllamaModel } from '@/lib/ollama';
import Link from 'next/link';

export default function Home() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError('Falha ao conectar ao Ollama. Verifique se o servidor está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb < 1 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AgonIA Dashboard</h1>
          <p className="text-slate-400">Gerenciamento de Modelos LLM Locais</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Modelos Instalados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{models.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Status do Servidor</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={error ? 'destructive' : 'default'} className={error ? '' : 'bg-green-600'}>
                {error ? 'Offline' : 'Online'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Porta Ollama</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">11434</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Armazenado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatSize(models.reduce((acc, m) => acc + m.size, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
              <CardDescription className="text-slate-400">Gerencie sua stack AgonIA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/models">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Gerenciar Modelos
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Chat com IA
                  </Button>
                </Link>
                <Link href="/monitor">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Monitoramento
                  </Button>
                </Link>
                <Button 
                  onClick={loadModels} 
                  disabled={loading}
                  className="w-full bg-slate-600 hover:bg-slate-700"
                >
                  {loading ? 'Carregando...' : 'Atualizar Status'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Serviços</CardTitle>
              <CardDescription className="text-slate-400">Status dos containers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Ollama</span>
                <Badge className="bg-green-600">Running</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Qdrant</span>
                <Badge className="bg-green-600">Running</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Frontend</span>
                <Badge className="bg-green-600">Running</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Modelos Instalados</CardTitle>
            <CardDescription className="text-slate-400">Lista de modelos LLM disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8 text-slate-400">Carregando modelos...</div>
            ) : models.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Nenhum modelo instalado.</p>
                <Link href="/models">
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                    Instalar Primeiro Modelo
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <Card key={model.name} className="bg-slate-700 border-slate-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white">{model.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-slate-300 border-slate-500">
                          {formatSize(model.size)}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(model.modified_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
