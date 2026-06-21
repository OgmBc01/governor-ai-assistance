import { Controller, Post, Body, Sse, MessageEvent, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Response } from 'express';
import { Observable, Subject } from 'rxjs';

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

  @Post('stream')
  async streamChat(@Body() body: ChatRequest, @Res() res: Response) {
    const { message, language = 'en', sessionId } = body;
    const session = sessionId || `session_${Date.now()}`;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      // Stream the response
      await this.chatService.streamMessage(
        session,
        message,
        language,
        res,
        (chunk: string) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      );

      // Send completion signal
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      res.write(`data: ${JSON.stringify({ error: error?.message || 'Unknown error' })}\n\n`);
      res.end();
    }
  }
}