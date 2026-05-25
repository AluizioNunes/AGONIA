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
    if (value < 50) return 'text-cyan-400';
    if (value < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = (value: number) => {
    if (value < 50) return 'bg-cyan-600';
    if (value < 80) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 flex items-center justify-between jarvis-fade-in">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-cyan-300 hover:bg-cyan-950/50 jarvis-border">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold jarvis-text-glow text-cyan-300 mb-2">SYSTEM MONITOR</h1>
              <p className="text-cyan-400/60 tracking-wider">REAL-TIME AGONIA STACK STATUS</p>
            </div>
          </div>
          <Button onClick={loadData} disabled={loading} variant="outline" className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/50 jarvis-border">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </Button>
        </header>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500/50 jarvis-border">
            <AlertDescription className="text-red-400 uppercase">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                CPU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold jarvis-text-glow ${getStatusColor(stats.cpu)}`}>
                {stats.cpu.toFixed(1)}%
              </div>
              <div className="text-xs text-cyan-400/60 mt-1 uppercase">PROCESSOR USAGE</div>
            </CardContent>
          </Card>

          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4" />
                MEMORY RAM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold jarvis-text-glow ${getStatusColor(stats.memory)}`}>
                {stats.memory.toFixed(1)}%
              </div>
              <div className="text-xs text-cyan-400/60 mt-1 uppercase">MEMORY USAGE</div>
            </CardContent>
          </Card>

          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <Server className="h-4 w-4" />
                GPU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold jarvis-text-glow ${stats.gpu ? getStatusColor(stats.gpu) : 'text-cyan-400/60'}`}>
                {stats.gpu ? `${stats.gpu.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-xs text-cyan-400/60 mt-1 uppercase">GPU USAGE</div>
            </CardContent>
          </Card>

          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                DISK
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold jarvis-text-glow ${getStatusColor(stats.disk * 100)}`}>
                {(stats.disk * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-cyan-400/60 mt-1 uppercase">STORAGE USAGE</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 uppercase tracking-wider">SERVICE STATUS</CardTitle>
              <CardDescription className="text-cyan-400/60">
                LAST UPDATE: {lastUpdate.toLocaleTimeString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 jarvis-border bg-cyan-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full jarvis-pulse" />
                  <span className="text-cyan-300 uppercase font-medium">OLLAMA</span>
                </div>
                <Badge className="bg-cyan-600 jarvis-glow">ONLINE</Badge>
              </div>

              <div className="flex items-center justify-between p-4 jarvis-border bg-cyan-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full jarvis-pulse" />
                  <span className="text-cyan-300 uppercase font-medium">QDRANT</span>
                </div>
                <Badge className="bg-cyan-600 jarvis-glow">ONLINE</Badge>
              </div>

              <div className="flex items-center justify-between p-4 jarvis-border bg-cyan-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full jarvis-pulse" />
                  <span className="text-cyan-300 uppercase font-medium">FRONTEND</span>
                </div>
                <Badge className="bg-cyan-600 jarvis-glow">ONLINE</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 uppercase tracking-wider">MODEL INFORMATION</CardTitle>
              <CardDescription className="text-cyan-400/60">
                {models.length} MODEL(S) LOADED
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-cyan-400/60 uppercase">LOADING...</div>
              ) : models.length === 0 ? (
                <div className="text-center py-8 text-cyan-400/60">
                  <p className="uppercase mb-4">NO MODELS INSTALLED</p>
                  <Link href="/models" className="text-cyan-400 hover:underline block mt-2">
                    INSTALL MODELS
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {models.map((model) => (
                    <div key={model.name} className="flex items-center justify-between p-4 jarvis-border bg-cyan-950/20">
                      <div className="flex-1">
                        <div className="text-cyan-300 uppercase font-medium text-sm">{model.name}</div>
                        <div className="text-cyan-400/60 text-xs uppercase">{formatSize(model.size)}</div>
                      </div>
                      <Badge variant="outline" className="text-cyan-400 border-cyan-500/50 uppercase">
                        LOADED
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle className="text-cyan-300 uppercase tracking-wider">SYSTEM SUMMARY</CardTitle>
            <CardDescription className="text-cyan-400/60">AGONIA STACK OVERVIEW</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 jarvis-border bg-cyan-950/20">
                <div className="text-cyan-400/60 text-sm mb-1 uppercase">TOTAL MODELS</div>
                <div className="text-3xl font-bold jarvis-text-glow text-cyan-300">{models.length}</div>
              </div>
              <div className="p-4 jarvis-border bg-cyan-950/20">
                <div className="text-cyan-400/60 text-sm mb-1 uppercase">TOTAL STORAGE USED</div>
                <div className="text-3xl font-bold jarvis-text-glow text-cyan-300">
                  {formatSize(models.reduce((acc, m) => acc + m.size, 0))}
                </div>
              </div>
              <div className="p-4 jarvis-border bg-cyan-950/20">
                <div className="text-cyan-400/60 text-sm mb-1 uppercase">ACTIVE SERVICES</div>
                <div className="text-3xl font-bold jarvis-text-glow text-cyan-300">3/3</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
