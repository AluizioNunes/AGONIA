'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { ArrowLeft, Play, Square, RefreshCw, Terminal } from 'lucide-react';

interface Service {
  name: string;
  status: string;
  image: string;
  ports: string[];
}

interface DeployLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export default function DeployPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [logs, setLogs] = useState<DeployLog[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    loadServices();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${FASTAPI_URL}/api/deploy/services`);
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      addLog('Erro ao carregar serviços: ' + error, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (serviceName: string) => {
    try {
      setDeploying(serviceName);
      setProgress(0);
      setLogs([]);

      addLog(`Iniciando deploy do serviço ${serviceName}...`, 'info');
      setProgress(10);

      const response = await fetch(`${FASTAPI_URL}/api/deploy/service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: serviceName, action: 'start' }),
      });

      if (!response.ok) throw new Error('Failed to start service');

      addLog(`Deploy do serviço ${serviceName} concluído com sucesso!`, 'success');
      setProgress(100);

      await loadServices();
    } catch (error) {
      addLog(`Erro ao fazer deploy do serviço ${serviceName}: ${error}`, 'error');
    } finally {
      setDeploying(null);
    }
  };

  const handleStop = async (serviceName: string) => {
    try {
      addLog(`Parando serviço ${serviceName}...`, 'warning');
      
      const response = await fetch(`${FASTAPI_URL}/api/deploy/service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: serviceName, action: 'stop' }),
      });

      if (!response.ok) throw new Error('Failed to stop service');
      
      addLog(`Serviço ${serviceName} parado com sucesso!`, 'success');
      await loadServices();
    } catch (error) {
      addLog(`Erro ao parar serviço ${serviceName}: ${error}`, 'error');
    }
  };

  const handleRestart = async (serviceName: string) => {
    await handleStop(serviceName);
    await new Promise(resolve => setTimeout(resolve, 500));
    await handleDeploy(serviceName);
  };

  const handleStreamLogs = (serviceName: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setLogs([]);
    addLog(`Conectando aos logs do serviço ${serviceName}...`, 'info');

    const eventSource = new EventSource(`${FASTAPI_URL}/api/deploy/logs/${serviceName}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = event.data;
      if (data.startsWith('Error:')) {
        addLog(data, 'error');
      } else {
        addLog(data.replace('data: ', '').trim(), 'info');
      }
    };

    eventSource.onerror = () => {
      addLog('Erro ao conectar aos logs', 'error');
      eventSource.close();
    };
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('running') || s.includes('up')) return 'text-green-400 border-green-500/50';
    if (s.includes('stopped') || s.includes('exited')) return 'text-red-400 border-red-500/50';
    return 'text-yellow-400 border-yellow-500/50';
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('running') || s.includes('up')) return 'bg-green-600/20 text-green-300 border-green-500/50';
    if (s.includes('stopped') || s.includes('exited')) return 'bg-red-600/20 text-red-300 border-red-500/50';
    return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/50';
  };

  const isRunning = (status: string) => {
    const s = status.toLowerCase();
    return s.includes('running') || s.includes('up');
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
            <h1 className="text-4xl font-bold jarvis-text-glow text-cyan-300 mb-2">DEPLOYMENT</h1>
            <p className="text-cyan-400/60 tracking-wider">MANAGE DOCKER SERVICES DEPLOYMENT</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Services List */}
          <Card className="jarvis-border jarvis-glow jarvis-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 uppercase tracking-wider">SERVICES</CardTitle>
              <CardDescription className="text-cyan-400/60">Manage Docker services deployment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-cyan-400/60">LOADING SERVICES...</div>
              ) : services.length === 0 ? (
                <div className="text-center py-8 text-cyan-400/60">NO SERVICES FOUND</div>
              ) : (
                services.map((service) => (
                  <div key={service.name} className="p-4 jarvis-border bg-cyan-950/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-cyan-300 uppercase font-bold mb-1">{service.name}</div>
                        <div className="text-cyan-400/60 text-sm mb-2">{service.image}</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {service.ports.map(port => (
                            <Badge key={port} variant="outline" className="text-cyan-400 border-cyan-500/50 text-xs">{port}</Badge>
                          ))}
                        </div>
                        <Badge className={getStatusBadge(service.status)}>{service.status.toUpperCase()}</Badge>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleStreamLogs(service.name)}
                          className="bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-300 hover:text-purple-200 jarvis-border transition-all"
                        >
                          <Terminal className="h-4 w-4" />
                        </Button>
                        {isRunning(service.status) ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleRestart(service.name)}
                              disabled={deploying !== null}
                              className="bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/50 text-yellow-300 hover:text-yellow-200 jarvis-border transition-all"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStop(service.name)}
                              disabled={deploying !== null}
                              className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-300 hover:text-red-200 jarvis-border transition-all"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleDeploy(service.name)}
                            disabled={deploying !== null}
                            className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-300 hover:text-green-200 jarvis-border transition-all"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Deploy Logs */}
          <Card className="jarvis-border-orange jarvis-glow-orange jarvis-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-orange-300 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                DEPLOYMENT LOGS
              </CardTitle>
              <CardDescription className="text-orange-400/60">Real-time deployment logs</CardDescription>
            </CardHeader>
            <CardContent>
              {deploying && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-300 uppercase text-sm">DEPLOY PROGRESS</span>
                    <span className="text-orange-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-orange-950/50 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="bg-black/50 rounded p-4 h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-orange-400/60 text-center py-8">
                    NO LOGS YET - SELECT A SERVICE TO VIEW LOGS
                  </div>
                ) : (
                  <>
                    {logs.map((log, index) => (
                      <div key={index} className={`mb-1 ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        'text-orange-300'
                      }`}>
                        <span className="text-orange-400/60">[{log.timestamp}]</span> {log.message}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </>
                )}
              </div>
              
              {logs.length > 0 && (
                <Button
                  onClick={() => setLogs([])}
                  className="mt-4 w-full bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/50 text-orange-300 hover:text-orange-200 jarvis-border-orange transition-all"
                >
                  CLEAR LOGS
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Alert className="bg-blue-900/20 border-blue-500/50 jarvis-border">
          <AlertDescription className="text-blue-400 uppercase">
            DEPLOY VIA DOCKER API: USE THIS INTERFACE TO DEPLOY SERVICES WITHOUT DEPLOYING LLM MODELS. MODELS ARE MANAGED SEPARATELY IN THE MODELS PAGE.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
