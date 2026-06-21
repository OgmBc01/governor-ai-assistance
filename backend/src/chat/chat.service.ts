import { Injectable, Logger } from '@nestjs/common';
import { GroqService } from '../services/groq.service';
import { DocumentsService } from '../documents/documents.service';
import { Response } from 'express';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private conversations: Map<string, Array<{ role: 'user' | 'assistant'; content: string }>> = new Map();

  constructor(
    private readonly groqService: GroqService,
    private readonly documentsService: DocumentsService,
  ) {}

  async sendMessage(
    sessionId: string,
    message: string,
    language: 'en' | 'ha' = 'en',
  ): Promise<{ response: string; sources?: string[] }> {
    try {
      const history = this.conversations.get(sessionId) || [];
      
      // Search knowledge base for relevant context
      const context = await this.documentsService.searchKnowledge(message);
      
      // Build enhanced prompt with context
      const enhancedMessage = this.buildEnhancedMessage(message, context, language);
      
      const response = await this.groqService.generateResponse(
        enhancedMessage,
        language,
        history,
      );

      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: response });
      
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      
      this.conversations.set(sessionId, history);

      const sources = this.getSources(message, language);

      return { response, sources };
    } catch (error: any) {
      this.logger.error(`Chat service error: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  private buildEnhancedMessage(
    message: string,
    context: string[],
    language: 'en' | 'ha'
  ): string {
    if (!context || context.length === 0) {
      return message;
    }

    const contextText = context.join('\n\n');
    const prefix = language === 'en'
      ? `Based on the following documents:\n${contextText}\n\nPlease answer: `
      : `Dangane da wadannan takardu:\n${contextText}\n\nDon Allah ka amsa: `;
    
    return `${prefix}${message}`;
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

  private getSources(message: string, language: 'en' | 'ha'): string[] {
    const sources: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Always include primary sources
    sources.push(language === 'en' ? 'Bauchi State Government Records' : 'Bayanan Gwamnatin Jihar Bauchi');
    sources.push(language === 'en' ? 'Official Governor\'s Office' : 'Ofishin Gwamna');

    // Dynamic sources based on message content
    if (lowerMessage.includes('health') || lowerMessage.includes('lafiya')) {
      sources.push(language === 'en' ? 'Ministry of Health Report' : 'Rahoton Ma\'aikatar Lafiya');
    }
    if (lowerMessage.includes('road') || lowerMessage.includes('hanya') || lowerMessage.includes('infrastructure')) {
      sources.push(language === 'en' ? 'Ministry of Works Database' : 'Bayanan Ma\'aikatar Ayyuka');
    }
    if (lowerMessage.includes('school') || lowerMessage.includes('makaranta') || lowerMessage.includes('education')) {
      sources.push(language === 'en' ? 'Ministry of Education Statistics' : 'Kididdigar Ma\'aikatar Ilimi');
    }
    if (lowerMessage.includes('agric') || lowerMessage.includes('noma') || lowerMessage.includes('farmer')) {
      sources.push(language === 'en' ? 'Ministry of Agriculture Records' : 'Bayanan Ma\'aikatar Noma');
    }
    if (lowerMessage.includes('water') || lowerMessage.includes('ruwa')) {
      sources.push(language === 'en' ? 'Water Resources Ministry Data' : 'Bayanan Ma\'aikatar Ruwa');
    }
    if (lowerMessage.includes('budget') || lowerMessage.includes('kasafin')) {
      sources.push(language === 'en' ? 'Budget Performance Report 2025' : 'Rahoton Kasafin Kudi 2025');
    }
    if (lowerMessage.includes('vision') || lowerMessage.includes('agenda') || lowerMessage.includes('manufa')) {
      sources.push(language === 'en' ? 'Bauchi Development Agenda 2050' : 'Manufar Ci Gaban Bauchi 2050');
    }

    // Limit sources to 4
    return sources.slice(0, 4);
  }

  clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  getHistory(sessionId: string): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.conversations.get(sessionId) || [];
  }
}