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
    <div className="min-h-screen w-full">
      <div className="w-full px-4 py-8">
        <header className="mb-12 jarvis-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-3 h-3 bg-cyan-400 rounded-full jarvis-pulse"></div>
            <h1 className="text-5xl font-bold jarvis-text-glow">AGONIA</h1>
          </div>
          <p className="text-cyan-300/70 text-lg tracking-wider">J.A.R.V.I.S. INTERFACE - AI MANAGEMENT SYSTEM</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 text-sm tracking-widest uppercase">MODELS INSTALLED</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold jarvis-text-glow text-cyan-300">{models.length}</div>
            </CardContent>
          </Card>

          <Card className="jarvis-border-purple jarvis-glow-purple jarvis-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-400 text-sm tracking-widest uppercase">SERVER STATUS</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={error ? 'destructive' : 'default'} className={error ? 'bg-red-600 jarvis-glow' : 'bg-purple-600 jarvis-glow-purple'}>
                {error ? 'OFFLINE' : 'ONLINE'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="jarvis-border-green jarvis-glow-green jarvis-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-green-400 text-sm tracking-widest uppercase">OLLAMA PORT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold jarvis-text-glow-green text-green-300">11434</div>
            </CardContent>
          </Card>

          <Card className="jarvis-border jarvis-glow-orange jarvis-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-400 text-sm tracking-widest uppercase">STORAGE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-300">
                {formatSize(models.reduce((acc, m) => acc + m.size, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="jarvis-border jarvis-glow jarvis-fade-in lg:col-span-2" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 tracking-widest uppercase">QUICK ACTIONS</CardTitle>
              <CardDescription className="text-cyan-400/60">Manage your AgonIA stack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/models">
                  <Button className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 jarvis-border transition-all">
                    MANAGE MODELS
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 jarvis-border transition-all">
                    AI CHAT
                  </Button>
                </Link>
                <Link href="/monitor">
                  <Button className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 jarvis-border transition-all">
                    MONITORING
                  </Button>
                </Link>
                <Button 
                  onClick={loadModels} 
                  disabled={loading}
                  className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 jarvis-border transition-all"
                >
                  {loading ? 'LOADING...' : 'REFRESH STATUS'}
                </Button>
                <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/50 text-orange-300 hover:text-orange-200 jarvis-border-orange transition-all">
                    OPEN WEBUI
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="jarvis-border-purple jarvis-glow-purple jarvis-fade-in" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="text-purple-300 tracking-widest uppercase">SERVICES</CardTitle>
              <CardDescription className="text-purple-400/60">Container status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 jarvis-border-purple bg-purple-950/20">
                <span className="text-purple-300 uppercase">OLLAMA</span>
                <Badge className="bg-green-600 jarvis-glow-green">RUNNING</Badge>
              </div>
              <div className="flex items-center justify-between p-3 jarvis-border-purple bg-purple-950/20">
                <span className="text-purple-300 uppercase">QDRANT</span>
                <Badge className="bg-green-600 jarvis-glow-green">RUNNING</Badge>
              </div>
              <div className="flex items-center justify-between p-3 jarvis-border-purple bg-purple-950/20">
                <span className="text-purple-300 uppercase">FRONTEND</span>
                <Badge className="bg-green-600 jarvis-glow-green">RUNNING</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="jarvis-border-green jarvis-glow-green jarvis-fade-in" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle className="text-green-300 tracking-widest uppercase">INSTALLED MODELS</CardTitle>
            <CardDescription className="text-green-400/60">Available LLM models</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg jarvis-border">
                <p className="text-red-400 uppercase">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8 text-green-400/60 uppercase">LOADING MODELS...</div>
            ) : models.length === 0 ? (
              <div className="text-center py-8 text-green-400/60">
                <p className="mb-4 uppercase">NO MODELS INSTALLED</p>
                <Link href="/models">
                  <Button className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-300 hover:text-green-200 jarvis-border-green transition-all">
                    INSTALL FIRST MODEL
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <Card key={model.name} className="jarvis-border-green jarvis-glow-green bg-green-950/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-300 text-sm uppercase">{model.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-green-400 border-green-500/50 uppercase">
                          {formatSize(model.size)}
                        </Badge>
                        <span className="text-xs text-green-400/60 uppercase">
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
