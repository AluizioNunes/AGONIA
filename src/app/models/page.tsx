'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ollama, OllamaModel } from '@/lib/ollama';
import Link from 'next/link';
import { Trash2, Download, ArrowLeft, Search, Filter } from 'lucide-react';

const RECOMMENDED_MODELS = [
  { name: 'deepseek-coder-v2', description: 'LLM principal para código', size: '~9 GB', family: 'DeepSeek', type: 'LLM', performance: 'Alta' },
  { name: 'qwen2.5-coder:7b', description: 'Velocidade / Computadores padrão', size: '~4.7 GB', family: 'Qwen', type: 'LLM', performance: 'Alta' },
  { name: 'deepseek-r1:8b', description: 'Raciocínio lógico e depuração leve', size: '~4.9 GB', family: 'DeepSeek', type: 'LLM', performance: 'Alta' },
  { name: 'nomic-embed-text', description: 'Embeddings para RAG', size: '~274 MB', family: 'Nomic', type: 'Embeddings', performance: 'Média' },
  { name: 'qwen2.5-coder:32b', description: 'Código complexo (se GPU permitir)', size: '~19 GB', family: 'Qwen', type: 'LLM', performance: 'Muito Alta' },
  { name: 'deepseek-r1:14b', description: 'Raciocínio e debugging', size: '~10 GB', family: 'DeepSeek', type: 'LLM', performance: 'Muito Alta' },
  { name: 'mxbai-embed-large', description: 'Embeddings de alta qualidade', size: '~670 MB', family: 'Mxbai', type: 'Embeddings', performance: 'Alta' },
  { name: 'starcoder2:3b', description: 'Modelo leve para hardware limitado', size: '~2 GB', family: 'StarCoder', type: 'LLM', performance: 'Média' },
];

export default function ModelsPage() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pulling, setPulling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modelName, setModelName] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [configWarning, setConfigWarning] = useState(false);
  const [activeTab, setActiveTab] = useState('installed');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('agonia-config');
      if (!savedConfig) {
        setConfigWarning(true);
      }
    }
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

  const filteredRecommended = RECOMMENDED_MODELS.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInstalled = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gray-950">
      <div className="w-full px-4 py-8 max-w-7xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-950/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-1">MODEL MANAGEMENT</h1>
            <p className="text-cyan-400/60 text-sm">Gerencie seus modelos LLM</p>
          </div>
        </header>

        {configWarning && (
          <Alert className="mb-6 bg-yellow-900/20 border-yellow-500/50">
            <AlertDescription className="text-yellow-400">
              <Link href="/integrations" className="underline hover:text-yellow-300">
                Configure as integrações primeiro - Clique aqui
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500/50">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="installed" className="data-[state=active]:bg-cyan-600">
              INSTALADOS ({models.length})
            </TabsTrigger>
            <TabsTrigger value="recommended" className="data-[state=active]:bg-cyan-600">
              RECOMENDADOS ({RECOMMENDED_MODELS.length})
            </TabsTrigger>
            <TabsTrigger value="download" className="data-[state=active]:bg-cyan-600">
              BAIXAR MODELO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-cyan-400">MODELOS INSTALADOS</CardTitle>
                    <CardDescription className="text-gray-400">
                      {models.length} modelo(s) instalado(s)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar modelos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12 text-gray-400">Carregando...</div>
                ) : filteredInstalled.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="mb-2">Nenhum modelo instalado</p>
                    <p className="text-sm text-gray-500">Vá para a aba RECOMENDADOS para baixar modelos</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredInstalled.map((model) => (
                      <div key={model.name} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors">
                        <div className="flex-1">
                          <div className="text-white font-medium mb-1">{model.name}</div>
                          <div className="text-gray-400 text-sm">
                            {formatSize(model.size)} • {new Date(model.modified_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(model.name)}
                          disabled={deleting !== null}
                          className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-400 hover:text-red-300"
                        >
                          {deleting === model.name ? 'REMOVENDO...' : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommended" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-cyan-400">MODELOS RECOMENDADOS</CardTitle>
                    <CardDescription className="text-gray-400">
                      {filteredRecommended.length} modelo(s) disponível(is)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar modelos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecommended.map((model) => (
                    <Card key={model.name} className="bg-gray-800 border-gray-700 hover:border-cyan-500/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-base mb-1">{model.name}</CardTitle>
                            <CardDescription className="text-gray-400 text-sm">{model.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-cyan-400 border-cyan-500/50 text-xs">{model.family}</Badge>
                          <Badge variant="outline" className="text-purple-400 border-purple-500/50 text-xs">{model.type}</Badge>
                          <Badge variant="outline" className="text-green-400 border-green-500/50 text-xs">{model.performance}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">{model.size}</span>
                          <Button
                            size="sm"
                            onClick={() => handlePull(model.name)}
                            disabled={pulling !== null}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white"
                          >
                            {pulling === model.name ? 'BAIXANDO...' : <Download className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="download" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-cyan-400">BAIXAR MODELO PERSONALIZADO</CardTitle>
                <CardDescription className="text-gray-400">
                  Digite o nome exato do modelo que deseja baixar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model-name" className="text-gray-300">NOME DO MODELO</Label>
                  <Input
                    id="model-name"
                    placeholder="ex: deepseek-coder-v2:latest"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-500">
                    Use o formato: nome:tag (ex: deepseek-coder-v2:latest)
                  </p>
                </div>
                <Button 
                  onClick={() => handlePull(modelName)}
                  disabled={!modelName || pulling !== null}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {pulling ? 'BAIXANDO...' : 'BAIXAR MODELO'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
