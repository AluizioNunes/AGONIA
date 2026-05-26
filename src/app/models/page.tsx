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
  // Qwen Family
  { name: 'qwen2.5-coder:7b', description: 'Velocidade / Computadores padrão', size: '~4.7 GB', family: 'Qwen', type: 'LLM', function: 'Código', performance: 'Alta', date: '2024' },
  { name: 'qwen2.5-coder:32b', description: 'Código complexo (se GPU permitir)', size: '~19 GB', family: 'Qwen', type: 'LLM', function: 'Código', performance: 'Muito Alta', date: '2024' },
  { name: 'qwen3-coder:30b', description: 'O melhor assistente geral de código local', size: '~19 GB', family: 'Qwen', type: 'LLM', function: 'Código', performance: 'Muito Alta', date: '2025' },
  { name: 'qwen3.5', description: 'Próxima geração Qwen', size: '~15 GB', family: 'Qwen', type: 'LLM', function: 'Geral', performance: 'Alta', date: '2025' },
  { name: 'qwen3.6', description: 'Qwen mais recente', size: '~16 GB', family: 'Qwen', type: 'LLM', function: 'Geral', performance: 'Muito Alta', date: '2025' },
  
  // DeepSeek Family
  { name: 'deepseek-coder-v2', description: 'LLM principal para código', size: '~9 GB', family: 'DeepSeek', type: 'LLM', function: 'Código', performance: 'Alta', date: '2024' },
  { name: 'deepseek-coder-v2:16b', description: 'Excelente custo-benefício em MoE', size: '~9.0 GB', family: 'DeepSeek', type: 'LLM', function: 'Código', performance: 'Muito Alta', date: '2024' },
  { name: 'deepseek-r1:8b', description: 'Raciocínio lógico e depuração leve', size: '~4.9 GB', family: 'DeepSeek', type: 'LLM', function: 'Raciocínio', performance: 'Alta', date: '2024' },
  { name: 'deepseek-r1:14b', description: 'Raciocínio e debugging', size: '~10 GB', family: 'DeepSeek', type: 'LLM', function: 'Raciocínio', performance: 'Muito Alta', date: '2024' },
  { name: 'deepseek-r1:32b', description: 'Engenharia reversa e algoritmos complexos', size: '~20 GB', family: 'DeepSeek', type: 'LLM', function: 'Raciocínio', performance: 'Extrema', date: '2024' },
  { name: 'deepseek-v4-pro', description: 'Modelo flagship completo da DeepSeek', size: '~40 GB', family: 'DeepSeek', type: 'LLM', function: 'Geral', performance: 'Extrema', date: '2025' },
  
  // Other Models
  { name: 'kimi-k2.6-thinking', description: 'Agentic Coding - 256K tokens contexto', size: '~15 GB', family: 'Moonshot', type: 'LLM', function: 'Agentic', performance: 'Extrema', date: '2025' },
  { name: 'glm-5.1', description: 'Zhipu AI - 200K contexto, licença MIT', size: '~18 GB', family: 'Zhipu', type: 'LLM', function: 'Geral', performance: 'Muito Alta', date: '2025' },
  { name: 'llama4-scout', description: 'Meta - Velocidade otimizada, function calling', size: '~12 GB', family: 'Meta', type: 'LLM', function: 'Geral', performance: 'Muito Alta', date: '2025' },
  { name: 'devstral-small-2', description: 'Integração com ferramentas e agentes', size: '~12 GB', family: 'Devstral', type: 'LLM', function: 'Agentes', performance: 'Alta', date: '2024' },
  { name: 'ollama-maverick', description: 'Modelo especializado Ollama', size: '~8 GB', family: 'Ollama', type: 'LLM', function: 'Geral', performance: 'Alta', date: '2024' },
  
  // Embeddings
  { name: 'nomic-embed-text', description: 'Embeddings para RAG', size: '~274 MB', family: 'Nomic', type: 'Embeddings', function: 'RAG', performance: 'Média', date: '2023' },
  { name: 'mxbai-embed-large', description: 'Embeddings de alta qualidade', size: '~670 MB', family: 'Mxbai', type: 'Embeddings', function: 'RAG', performance: 'Alta', date: '2024' },
  { name: 'starcoder2:3b', description: 'Modelo leve para hardware limitado', size: '~2 GB', family: 'StarCoder', type: 'LLM', function: 'Código', performance: 'Média', date: '2023' },
];

export default function ModelsPage() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pulling, setPulling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modelName, setModelName] = useState('');
  
  // Filtros e ordenação
  const [filterFamily, setFilterFamily] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFunction, setFilterFunction] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [configWarning, setConfigWarning] = useState(false);

  useEffect(() => {
    // Check if configuration exists
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

  // Extrair valor numérico do tamanho para ordenação
  const getSizeValue = (sizeStr: string): number => {
    const match = sizeStr.match(/([\d.]+)/);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    return sizeStr.includes('MB') ? value / 1024 : value;
  };

  // Filtrar e ordenar modelos recomendados
  const filteredModels = RECOMMENDED_MODELS.filter(model => {
    if (filterFamily !== 'all' && model.family !== filterFamily) return false;
    if (filterType !== 'all' && model.type !== filterType) return false;
    if (filterFunction !== 'all' && model.function !== filterFunction) return false;
    if (searchQuery && !model.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return getSizeValue(a.size) - getSizeValue(b.size);
      case 'date':
        return parseInt(b.date) - parseInt(a.date);
      case 'performance':
        const perfOrder = { 'Extrema': 4, 'Muito Alta': 3, 'Alta': 2, 'Média': 1 };
        return perfOrder[b.performance as keyof typeof perfOrder] - perfOrder[a.performance as keyof typeof perfOrder];
      default:
        return 0;
    }
  });

  // Obter valores únicos para filtros
  const families = [...new Set(RECOMMENDED_MODELS.map(m => m.family))];
  const types = [...new Set(RECOMMENDED_MODELS.map(m => m.type))];
  const functions = [...new Set(RECOMMENDED_MODELS.map(m => m.function))];

  return (
    <div className="min-h-screen w-full overflow-y-auto">
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

        {configWarning && (
          <Alert className="mb-6 bg-yellow-900/20 border-yellow-500/50 jarvis-border">
            <AlertDescription className="text-yellow-400 uppercase">
              <Link href="/integrations" className="underline hover:text-yellow-300">
                CONFIGURE AS INTEGRAÇÕES PRIMEIRO - CLIQUE AQUI PARA CONFIGURAR URLS DO SERVIDOR
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500/50 jarvis-border">
            <AlertDescription className="text-red-400 uppercase">{error}</AlertDescription>
          </Alert>
        )}

        {/* Filtros e Busca */}
        <Card className="jarvis-border jarvis-glow jarvis-fade-in mb-8" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-cyan-300 uppercase tracking-wider">FILTERS & SEARCH</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-cyan-400 uppercase text-sm">SEARCH</Label>
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-cyan-950/30 border-cyan-500/50 text-cyan-300 placeholder-cyan-400/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-400 uppercase text-sm">FAMILY</Label>
                <select
                  value={filterFamily}
                  onChange={(e) => setFilterFamily(e.target.value)}
                  className="w-full bg-cyan-950/30 border-cyan-500/50 text-cyan-300 p-2 rounded"
                >
                  <option value="all">All Families</option>
                  {families.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-400 uppercase text-sm">TYPE</Label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-cyan-950/30 border-cyan-500/50 text-cyan-300 p-2 rounded"
                >
                  <option value="all">All Types</option>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-400 uppercase text-sm">FUNCTION</Label>
                <select
                  value={filterFunction}
                  onChange={(e) => setFilterFunction(e.target.value)}
                  className="w-full bg-cyan-950/30 border-cyan-500/50 text-cyan-300 p-2 rounded"
                >
                  <option value="all">All Functions</option>
                  {functions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className="text-cyan-400 uppercase text-sm">SORT BY:</Label>
              <div className="flex gap-2">
                {['name', 'size', 'date', 'performance'].map(sort => (
                  <Button
                    key={sort}
                    size="sm"
                    variant={sortBy === sort ? 'default' : 'outline'}
                    onClick={() => setSortBy(sort)}
                    className={sortBy === sort ? 'bg-cyan-600 text-white' : 'border-cyan-500/50 text-cyan-300'}
                  >
                    {sort.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

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
              <CardDescription className="text-green-400/60">
                {filteredModels.length} MODEL(S) • FILTERED BY: {filterFamily !== 'all' ? filterFamily : 'ALL'} / {filterType !== 'all' ? filterType : 'ALL'} / {filterFunction !== 'all' ? filterFunction : 'ALL'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredModels.map((model) => (
                <div key={model.name} className="p-4 jarvis-border-green bg-green-950/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-green-300 uppercase font-bold mb-1">{model.name}</div>
                      <div className="text-green-400/60 text-sm mb-2">{model.description}</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-green-400 border-green-500/50 uppercase text-xs">{model.family}</Badge>
                        <Badge variant="outline" className="text-green-400 border-green-500/50 uppercase text-xs">{model.type}</Badge>
                        <Badge variant="outline" className="text-green-400 border-green-500/50 uppercase text-xs">{model.function}</Badge>
                        <Badge variant="outline" className="text-green-400 border-green-500/50 uppercase text-xs">{model.date}</Badge>
                        <Badge variant="outline" className={model.performance === 'Extrema' ? 'text-orange-400 border-orange-500/50 uppercase text-xs' : model.performance === 'Muito Alta' ? 'text-purple-400 border-purple-500/50 uppercase text-xs' : 'text-green-400 border-green-500/50 uppercase text-xs'}>{model.performance}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
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
