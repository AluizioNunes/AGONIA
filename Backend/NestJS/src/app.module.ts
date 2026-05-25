import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { OllamaService } from './ollama/ollama.service';
import { OllamaController } from './ollama/ollama.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [OllamaController],
  providers: [OllamaService],
})
export class AppModule {}
