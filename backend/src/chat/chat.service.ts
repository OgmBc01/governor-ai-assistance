import { Injectable, Logger } from '@nestjs/common';
import { GroqService } from '../services/groq.service';

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

      const sources = [
        'Bauchi State Government Records',
        'Official Governor\'s Office',
        'Bauchi Development Agenda 2050',
      ];

      return { response, sources };
    } catch (error: any) {
      this.logger.error(`Chat service error: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  getHistory(sessionId: string): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.conversations.get(sessionId) || [];
  }
}