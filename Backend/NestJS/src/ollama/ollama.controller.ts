import { Controller, Get, Post, Body, HttpException } from '@nestjs/common';
import { OllamaService } from './ollama.service';

@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Get('health')
  healthCheck() {
    return { status: 'healthy', backend: 'nestjs' };
  }

  @Get('models')
  async listModels() {
    return this.ollamaService.listModels();
  }

  @Post('chat')
  async chat(@Body() body: { model: string; messages: any[]; stream?: boolean }) {
    return this.ollamaService.chat(body.model, body.messages, body.stream || false);
  }

  @Post('generate')
  async generate(@Body() body: { model: string; prompt: string; stream?: boolean }) {
    return this.ollamaService.generate(body.model, body.prompt, body.stream || false);
  }
}
