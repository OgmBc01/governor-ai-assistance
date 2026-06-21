import { Injectable, Logger } from '@nestjs/common';
import { GroqService } from '../services/groq.service';
import { Response } from 'express';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private conversations: Map<string, Array<{ role: 'user' | 'assistant'; content: string }>> = new Map();

  constructor(private readonly groqService: GroqService) {}

  async sendMessage(
    sessionId: string,
    message: string,
    language: 'en' | 'ha' = 'en',
  ): Promise<{ response: string; sources?: string[] }> {
    try {
      const history = this.conversations.get(sessionId) || [];
      
      const response = await this.groqService.generateResponse(
        message,
        language,
        history,
      );

      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: response });
      
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      
      this.conversations.set(sessionId, history);

      const sources = this.getSources(message);

      return { response, sources };
    } catch (error: any) {
      this.logger.error(`Chat service error: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  async streamMessage(
    sessionId: string,
    message: string,
    language: 'en' | 'ha',
    res: Response,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    try {
      const history = this.conversations.get(sessionId) || [];
      
      // Get streaming response from Groq
      const stream = await this.groqService.generateStream(
        message,
        language,
        history,
      );

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      }

      // Save to history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: fullResponse });
      
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      
      this.conversations.set(sessionId, history);
    } catch (error: any) {
      this.logger.error(`Stream error: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  private getSources(message: string): string[] {
    const sources = [
      'Bauchi State Government Records',
      'Official Governor\'s Office',
      'Bauchi Development Agenda 2050',
    ];

    // Dynamic sources based on message content
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('health') || lowerMessage.includes('lafiya')) {
      sources.push('Ministry of Health Annual Report');
    }
    if (lowerMessage.includes('road') || lowerMessage.includes('hanya')) {
      sources.push('Ministry of Works Infrastructure Database');
    }
    if (lowerMessage.includes('school') || lowerMessage.includes('makaranta')) {
      sources.push('Ministry of Education Statistics');
    }

    return sources;
  }

  clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  getHistory(sessionId: string): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.conversations.get(sessionId) || [];
  }
}