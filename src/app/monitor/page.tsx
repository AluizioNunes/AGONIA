'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ollama, OllamaModel } from '@/lib/ollama';
import Link from 'next/link';
import { ArrowLeft, Activity, Cpu, HardDrive, Server, RefreshCw } from 'lucide-react';

interface SystemStats {
  cpu: number;
  memory: number;
  disk: number;
  gpu?: number;
}

export default function MonitorPage() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [stats, setStats] = useState<SystemStats>({ cpu: 0, memory: 0, disk: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar modelos
      const modelsData = await ollama.listModels();
      setModels(modelsData.models);
      
      // Simular stats do sistema (em produção, isso viria de uma API real)
      setStats({
        cpu: Math.random() * 30 + 10,
        memory: Math.random() * 40 + 30,
        disk: modelsData.models.reduce((acc, m) => acc + m.size, 0) / (1024 * 1024 * 1024 * 100),
        gpu: Math.random() * 60 + 20,
      });
      
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Falha ao carregar dados do sistema.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb < 1 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${gb.toFixed(1)} GB`;
  };

  const getStatusColor = (value: number) => {
    if (value < 50) return 'text-green-400';
    if (value < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = (value: number) => {
    if (value < 50) return 'bg-green-600';
    if (value < 80) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Monitoramento</h1>
              <p className="text-slate-400">Status da stack AgonIA em tempo real</p>
            </div>
          </div>
          <Button onClick={loadData} disabled={loading} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </header>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-800">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                CPU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(stats.cpu)}`}>
                {stats.cpu.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Uso do processador</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Memória RAM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(stats.memory)}`}>
                {stats.memory.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Uso de memória</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Server className="h-4 w-4" />
                GPU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.gpu ? getStatusColor(stats.gpu) : 'text-slate-400'}`}>
                {stats.gpu ? `${stats.gpu.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-xs text-slate-400 mt-1">Uso da GPU</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Disco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(stats.disk * 100)}`}>
                {(stats.disk * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Uso de armazenamento</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Status dos Serviços</CardTitle>
              <CardDescription className="text-slate-400">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-white font-medium">Ollama</span>
                </div>
                <Badge className="bg-green-600">Online</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-white font-medium">Qdrant</span>
                </div>
                <Badge className="bg-green-600">Online</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-white font-medium">Frontend</span>
                </div>
                <Badge className="bg-green-600">Online</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Informações dos Modelos</CardTitle>
              <CardDescription className="text-slate-400">
                {models.length} modelo(s) carregado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-400">Carregando...</div>
              ) : models.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Nenhum modelo instalado.
                  <Link href="/models" className="text-blue-400 hover:underline block mt-2">
                    Instalar modelos
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {models.map((model) => (
                    <div key={model.name} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{model.name}</div>
                        <div className="text-slate-400 text-xs">{formatSize(model.size)}</div>
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-600">
                        Carregado
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Resumo do Sistema</CardTitle>
            <CardDescription className="text-slate-400">Visão geral da stack AgonIA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="text-slate-400 text-sm mb-1">Total de Modelos</div>
                <div className="text-3xl font-bold text-white">{models.length}</div>
              </div>
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="text-slate-400 text-sm mb-1">Espaço Total Usado</div>
                <div className="text-3xl font-bold text-white">
                  {formatSize(models.reduce((acc, m) => acc + m.size, 0))}
                </div>
              </div>
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="text-slate-400 text-sm mb-1">Serviços Ativos</div>
                <div className="text-3xl font-bold text-white">3/3</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
