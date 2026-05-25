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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        <header className="mb-4 flex items-center gap-4 flex-shrink-0 jarvis-fade-in">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-cyan-300 hover:bg-cyan-950/50 jarvis-border">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold jarvis-text-glow text-cyan-300 mb-2">AI CHAT</h1>
            <p className="text-cyan-400/60 tracking-wider">COMMUNICATE WITH LOCAL LLM MODELS</p>
          </div>
          <Button onClick={clearChat} variant="outline" className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/50 jarvis-border">
            CLEAR CHAT
          </Button>
        </header>

        <div className="flex-1 flex gap-4 min-h-0">
          <Card className="jarvis-border jarvis-glow w-64 flex-shrink-0 jarvis-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-cyan-300 uppercase tracking-wider text-lg">MODELS</CardTitle>
              <CardDescription className="text-cyan-400/60">Select a model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {modelsLoading ? (
                <div className="text-cyan-400/60 text-sm uppercase">LOADING...</div>
              ) : models.length === 0 ? (
                <div className="text-cyan-400/60 text-sm uppercase">
                  NO MODELS INSTALLED
                  <Link href="/models" className="text-cyan-400 hover:underline block mt-2">
                    INSTALL MODELS
                  </Link>
                </div>
              ) : (
                <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value || '')}>
                  <SelectTrigger className="bg-cyan-950/30 border-cyan-500/50 text-cyan-300 uppercase">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent className="bg-cyan-950/30 border-cyan-500/50">
                    {models.map((model) => (
                      <SelectItem key={model.name} value={model.name} className="text-cyan-300 uppercase">
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {selectedModel && (
                <div className="mt-4 p-3 jarvis-border bg-cyan-950/20">
                  <div className="text-cyan-300 text-sm uppercase font-medium mb-1">CURRENT MODEL</div>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-500/50 uppercase">
                    {selectedModel}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="jarvis-border jarvis-glow flex-1 flex flex-col min-h-0 jarvis-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-cyan-300 uppercase tracking-wider">CONVERSATION</CardTitle>
              <CardDescription className="text-cyan-400/60">
                {messages.length} MESSAGE(S)
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-cyan-400/60">
                    <p className="text-lg mb-2 uppercase">INITIATE CONVERSATION</p>
                    <p className="text-sm">Select a model and type your message below</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg jarvis-border ${
                          msg.role === 'user'
                            ? 'bg-cyan-600/20 text-cyan-300'
                            : 'bg-cyan-950/30 text-cyan-300'
                        }`}
                      >
                        <div className="text-xs uppercase font-medium mb-2 opacity-70">
                          {msg.role === 'user' ? 'YOU' : selectedModel}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-cyan-950/30 text-cyan-300 p-4 rounded-lg jarvis-border flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="uppercase">PROCESSING...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && (
                <Alert className="mb-4 bg-red-900/20 border-red-500/50 jarvis-border flex-shrink-0">
                  <AlertDescription className="text-red-400 uppercase">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 flex-shrink-0">
                <Textarea
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!selectedModel || loading}
                  className="bg-cyan-950/30 border-cyan-500/50 text-cyan-300 placeholder-cyan-400/40 min-h-[60px] max-h-[200px] resize-none uppercase"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || !selectedModel || loading}
                  className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 jarvis-border px-6 transition-all"
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
