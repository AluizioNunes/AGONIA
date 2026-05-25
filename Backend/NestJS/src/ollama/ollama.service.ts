import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OllamaService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.ollamaUrl = this.configService.get('OLLAMA_URL', 'http://ollama:11434');
  }

  private ollamaUrl: string;

  async listModels() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.ollamaUrl}/api/tags`),
      );
      return response.data.models || [];
    } catch (error) {
      throw new HttpException('Failed to fetch models', 500);
    }
  }

  async chat(model: string, messages: any[], stream = false) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.ollamaUrl}/api/chat`, {
          model,
          messages,
          stream,
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to generate chat', 500);
    }
  }

  async generate(model: string, prompt: string, stream = false) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.ollamaUrl}/api/generate`, {
          model,
          prompt,
          stream,
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to generate', 500);
    }
  }
}
