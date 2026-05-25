'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ollama, OllamaModel, ChatMessage } from '@/lib/ollama';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadModels = async () => {
    try {
      setModelsLoading(true);
      const data = await ollama.listModels();
      setModels(data.models);
      if (data.models.length > 0 && !selectedModel) {
        setSelectedModel(data.models[0].name);
      }
      setError(null);
    } catch (err) {
      setError('Falha ao conectar ao Ollama.');
      console.error(err);
    } finally {
      setModelsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedModel || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await ollama.chat([...messages, userMessage], selectedModel);
      const assistantMessage: ChatMessage = {
        role: response.message.role as 'assistant',
        content: response.message.content
      };
      setMessages([...messages, userMessage, assistantMessage]);
    } catch (err) {
      setError('Falha ao enviar mensagem para o modelo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        <header className="mb-4 flex items-center gap-4 flex-shrink-0">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">Chat com IA</h1>
            <p className="text-slate-400">Converse com os modelos LLM locais</p>
          </div>
          <Button onClick={clearChat} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
            Limpar Chat
          </Button>
        </header>

        <div className="flex-1 flex gap-4 min-h-0">
          <Card className="bg-slate-800 border-slate-700 w-64 flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-white text-lg">Modelos</CardTitle>
              <CardDescription className="text-slate-400">Selecione um modelo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {modelsLoading ? (
                <div className="text-slate-400 text-sm">Carregando...</div>
              ) : models.length === 0 ? (
                <div className="text-slate-400 text-sm">
                  Nenhum modelo instalado.
                  <Link href="/models" className="text-blue-400 hover:underline block mt-2">
                    Instalar modelos
                  </Link>
                </div>
              ) : (
                <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value || '')}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {models.map((model) => (
                      <SelectItem key={model.name} value={model.name} className="text-white">
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {selectedModel && (
                <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                  <div className="text-white text-sm font-medium mb-1">Modelo Atual</div>
                  <Badge variant="outline" className="text-slate-300 border-slate-500">
                    {selectedModel}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-white">Conversa</CardTitle>
              <CardDescription className="text-slate-400">
                {messages.length} mensagem(s)
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-lg mb-2">Inicie uma conversa</p>
                    <p className="text-sm">Selecione um modelo e digite sua mensagem abaixo</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        <div className="text-xs font-medium mb-2 opacity-70">
                          {msg.role === 'user' ? 'Você' : selectedModel}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-white p-4 rounded-lg flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Pensando...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && (
                <Alert className="mb-4 bg-red-900/20 border-red-800 flex-shrink-0">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 flex-shrink-0">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!selectedModel || loading}
                  className="bg-slate-700 border-slate-600 text-white min-h-[60px] max-h-[200px] resize-none"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || !selectedModel || loading}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
