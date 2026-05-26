'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { ArrowLeft, Save, RefreshCw, Server, Database, Globe, Shield } from 'lucide-react';

interface Config {
  ollamaUrl: string;
  fastapiUrl: string;
  nestjsUrl: string;
  qdrantUrl: string;
  openWebuiUrl: string;
  dataPath: string;
}

const defaultConfig: Config = {
  ollamaUrl: 'http://localhost:11434',
  fastapiUrl: 'http://localhost:8001',
  nestjsUrl: 'http://localhost:3001',
  qdrantUrl: 'http://localhost:6333',
  openWebuiUrl: 'http://localhost:8080',
  dataPath: '/data/ollama',
};

export default function IntegrationsPage() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('agonia-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('agonia-config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    localStorage.removeItem('agonia-config');
  };

  const testConnection = async (service: string, url: string) => {
    setTesting(service);
    try {
      let testUrl = url;
      // Adicionar endpoint correto para cada serviço
      if (service === 'ollama') {
        testUrl = `${url}/api/tags`;
      } else if (service === 'fastapi') {
        testUrl = `${url}/health`;
      } else if (service === 'nestjs') {
        testUrl = `${url}/ollama/health`;
      } else if (service === 'qdrant') {
        testUrl = `${url}/readyz`;
      } else if (service === 'openwebui') {
        // Open WebUI não tem endpoint de health público, vamos tentar acessar a raiz
        testUrl = url;
      }
      const response = await fetch(testUrl, { method: 'GET' });
      setTestResults(prev => ({ ...prev, [service]: response.ok }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [service]: false }));
    } finally {
      setTesting(null);
    }
  };

  const handleAutoDetect = () => {
    // Auto-detect based on current hostname
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    setConfig(prev => ({
      ...prev,
      ollamaUrl: `${protocol}//${hostname}:11434`,
      fastapiUrl: `${protocol}//${hostname}:8001`,
      nestjsUrl: `${protocol}//${hostname}:3001`,
      qdrantUrl: `${protocol}//${hostname}:6333`,
      openWebuiUrl: `${protocol}//${hostname}:8080`,
    }));
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
            <h1 className="text-4xl font-bold jarvis-text-glow text-cyan-300 mb-2">INTEGRAÇÕES</h1>
            <p className="text-cyan-400/60 tracking-wider">CONFIGURAÇÃO DE SISTEMAS E SERVIÇOS</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Ollama Configuration */}
          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="h-5 w-5" />
                OLLAMA
              </CardTitle>
              <CardDescription className="text-cyan-400/60">Servidor de Modelos LLM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-cyan-300">URL do Ollama</Label>
                <Input
                  value={config.ollamaUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                  className="bg-cyan-950/20 border-cyan-500/50 text-cyan-300 jarvis-border"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => testConnection('ollama', config.ollamaUrl)}
                  disabled={testing === 'ollama'}
                  className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 jarvis-border transition-all"
                >
                  {testing === 'ollama' ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Testar'}
                </Button>
                {testResults.ollama !== undefined && (
                  <span className={testResults.ollama ? 'text-green-400' : 'text-red-400'}>
                    {testResults.ollama ? '✓ Conectado' : '✗ Falhou'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* FastAPI Configuration */}
          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="h-5 w-5" />
                FASTAPI
              </CardTitle>
              <CardDescription className="text-cyan-400/60">Backend Python</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-cyan-300">URL do FastAPI</Label>
                <Input
                  value={config.fastapiUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, fastapiUrl: e.target.value }))}
                  className="bg-cyan-950/20 border-cyan-500/50 text-cyan-300 jarvis-border"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => testConnection('fastapi', config.fastapiUrl)}
                  disabled={testing === 'fastapi'}
                  className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 jarvis-border transition-all"
                >
                  {testing === 'fastapi' ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Testar'}
                </Button>
                {testResults.fastapi !== undefined && (
                  <span className={testResults.fastapi ? 'text-green-400' : 'text-red-400'}>
                    {testResults.fastapi ? '✓ Conectado' : '✗ Falhou'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* NestJS Configuration */}
          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="h-5 w-5" />
                NESTJS
              </CardTitle>
              <CardDescription className="text-cyan-400/60">Backend TypeScript</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-cyan-300">URL do NestJS</Label>
                <Input
                  value={config.nestjsUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, nestjsUrl: e.target.value }))}
                  className="bg-cyan-950/20 border-cyan-500/50 text-cyan-300 jarvis-border"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => testConnection('nestjs', config.nestjsUrl)}
                  disabled={testing === 'nestjs'}
                  className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 jarvis-border transition-all"
                >
                  {testing === 'nestjs' ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Testar'}
                </Button>
                {testResults.nestjs !== undefined && (
                  <span className={testResults.nestjs ? 'text-green-400' : 'text-red-400'}>
                    {testResults.nestjs ? '✓ Conectado' : '✗ Falhou'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Qdrant Configuration */}
          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Database className="h-5 w-5" />
                QDRANT
              </CardTitle>
              <CardDescription className="text-cyan-400/60">Banco de Vetores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-cyan-300">URL do Qdrant</Label>
                <Input
                  value={config.qdrantUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, qdrantUrl: e.target.value }))}
                  className="bg-cyan-950/20 border-cyan-500/50 text-cyan-300 jarvis-border"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => testConnection('qdrant', config.qdrantUrl)}
                  disabled={testing === 'qdrant'}
                  className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 jarvis-border transition-all"
                >
                  {testing === 'qdrant' ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Testar'}
                </Button>
                {testResults.qdrant !== undefined && (
                  <span className={testResults.qdrant ? 'text-green-400' : 'text-red-400'}>
                    {testResults.qdrant ? '✓ Conectado' : '✗ Falhou'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Open WebUI Configuration */}
          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-5 w-5" />
                OPEN WEBUI
              </CardTitle>
              <CardDescription className="text-cyan-400/60">Interface Web</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-cyan-300">URL do Open WebUI</Label>
                <Input
                  value={config.openWebuiUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, openWebuiUrl: e.target.value }))}
                  className="bg-cyan-950/20 border-cyan-500/50 text-cyan-300 jarvis-border"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => testConnection('openwebui', config.openWebuiUrl)}
                  disabled={testing === 'openwebui'}
                  className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 jarvis-border transition-all"
                >
                  {testing === 'openwebui' ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Testar'}
                </Button>
                {testResults.openwebui !== undefined && (
                  <span className={testResults.openwebui ? 'text-green-400' : 'text-red-400'}>
                    {testResults.openwebui ? '✓ Conectado' : '✗ Falhou'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Path Configuration */}
          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Database className="h-5 w-5" />
                DADOS
              </CardTitle>
              <CardDescription className="text-cyan-400/60">Caminho de Armazenamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-cyan-300">Caminho dos Modelos</Label>
                <Input
                  value={config.dataPath}
                  onChange={(e) => setConfig(prev => ({ ...prev, dataPath: e.target.value }))}
                  className="bg-cyan-950/20 border-cyan-500/50 text-cyan-300 jarvis-border"
                />
              </div>
              <Alert className="bg-blue-900/20 border-blue-500/50 jarvis-border">
                <AlertDescription className="text-blue-400 text-sm">
                  Este caminho é usado pelo Docker para armazenar os modelos. No Linux use /data/ollama, no Windows use C:\\data\\ollama
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={handleSave}
            className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-300 hover:text-green-200 jarvis-border transition-all"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
          <Button
            onClick={handleReset}
            className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-300 hover:text-red-200 jarvis-border transition-all"
          >
            Restaurar Padrão
          </Button>
          <Button
            onClick={handleAutoDetect}
            className="bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-300 hover:text-purple-200 jarvis-border transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Auto-Detectar
          </Button>
        </div>

        {saved && (
          <Alert className="bg-green-900/20 border-green-500/50 jarvis-border">
            <AlertDescription className="text-green-400 uppercase">
              Configurações salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        <Alert className="bg-yellow-900/20 border-yellow-500/50 jarvis-border">
          <AlertDescription className="text-yellow-400 uppercase">
            TODAS AS CONFIGURAÇÕES SÃO ARMAZENADAS LOCALMENTE NO NAVEGADOR. NENHUM DADO É ENVIADO PARA SERVIDORES EXTERNOS.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
