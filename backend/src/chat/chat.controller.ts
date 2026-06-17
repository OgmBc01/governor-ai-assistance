import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';

interface ChatRequest {
  message: string;
  language?: 'en' | 'ha';
  sessionId?: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: ChatRequest) {
    const { message, language = 'en', sessionId } = body;
    const session = sessionId || `session_${Date.now()}`;

    const result = await this.chatService.sendMessage(session, message, language);
    
    return {
      success: true,
      data: {
        response: result.response,
        sources: result.sources || [],
        sessionId: session,
        language,
      },
    };
  }
}