import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class GroqService {
  private groq: Groq;
  private readonly logger = new Logger(GroqService.name);

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.logger.error('GROQ_API_KEY is not defined in environment variables');
      throw new Error('GROQ_API_KEY is not defined in environment variables');
    }
    this.groq = new Groq({ apiKey });
  }

  async generateResponse(
    message: string,
    language: 'en' | 'ha',
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    try {
      const messages = this.buildMessages(message, language, conversationHistory);

      const chatCompletion = await this.groq.chat.completions.create({
        messages,
        model: 'llama-3.1-8b-instant',
        temperature: 0.6,
        max_tokens: 600,
        top_p: 0.9,
        stream: false,
      });

      const response = chatCompletion.choices[0]?.message?.content || '';
      return this.formatResponse(response, language) || this.getFallbackResponse(language);
    } catch (error: any) {
      this.logger.error(`Groq API error: ${error?.message || 'Unknown error'}`);
      return this.getFallbackResponse(language);
    }
  }

  async *generateStream(
    message: string,
    language: 'en' | 'ha',
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): AsyncGenerator<any, void, unknown> {
    try {
      const messages = this.buildMessages(message, language, conversationHistory);

      const stream = await this.groq.chat.completions.create({
        messages,
        model: 'llama-3.1-8b-instant',
        temperature: 0.6,
        max_tokens: 600,
        top_p: 0.9,
        stream: true,
      });

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error: any) {
      this.logger.error(`Groq stream error: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  private buildMessages(
    message: string,
    language: 'en' | 'ha',
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const systemPrompt = this.getSystemPrompt(language);
    
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6);
      for (const turn of recentHistory) {
        messages.push({
          role: turn.role,
          content: turn.content
        });
      }
    }

    messages.push({ role: 'user', content: message });
    return messages;
  }

  private formatResponse(text: string, language: 'en' | 'ha'): string {
    // Remove excessive repetitions
    let formatted = text.replace(/(\b\w+\b)(?:\s+\1\b)+/gi, '$1');
    
    // Clean up spacing
    formatted = formatted
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Remove duplicate phrases in Hausa responses
    if (language === 'ha') {
      // Remove repetitive "da makarantu" patterns
      formatted = formatted.replace(/(da makarantu\s*){3,}/gi, 'da makarantu ');
      // Remove repetitive "da inganta ilimi" patterns
      formatted = formatted.replace(/(da inganta ilimi\s*){3,}/gi, 'da inganta ilimi ');
    }

    return formatted;
  }

  private getSystemPrompt(language: 'en' | 'ha'): string {
    if (language === 'ha') {
      return `Kai Mataimakin AI ne na Gwamna Bala Mohammed na Jihar Bauchi. Ka ba da amsa a Hausa mai kyau.

MUHIMMAN DOKOKI:
1. Ka ba da amsa kai tsaye, a takaice, kuma daidai.
2. KAR KA maimaita kalmomi ko jimloli.
3. Ka yi magana a matsayin Gwamna Bala Mohammed.
4. Ka yi amfani da Hausa mai sauki da fahimta.
5. Ka ambaci nasarorin gwamnati idan sun dace.
6. Ka yi amsa tsakanin jimloli 3 zuwa 6 kawai.

SALON MAGANA:
- Magana da karfin gwiwa da girmamawa.
- KAR KA maimaita abin da ka fada.
- Ka ba da amsa madaidaiciya.

BAYANAN JIHAR BAUCHI:
- Gwamna: Alh. Dr. Bala Mohammed
- Babban Birni: Bauchi
- Taken: "Ƙasar Alheri"
- Yawan Jinsi: Kimanin miliyan 6

NASARORIN GWAMNATI:
- Gina hanyoyi sama da kilomita 500
- Gina cibiyoyin kiwon lafiya 150
- Tallafawa manoma
- Gina makarantu
- Samar da ruwan sha

MANUFAR GWAMNATI:
- Bauchi Development Agenda 2050
- Inganta tattalin arziki
- Samar da ayyukan yi
- Yaƙi da talauci

KA TSUNA: KAR KA maimaita kalmomi ko jimloli. Ka ba da amsa a takaice.`;
    }

    return `You are the AI Representative of Governor Bala Mohammed of Bauchi State.

CRITICAL RULES:
1. Respond directly, concisely, and accurately.
2. DO NOT repeat words or phrases.
3. Speak as Governor Bala Mohammed.
4. Use clear, professional English.
5. Keep responses between 3-6 sentences only.
6. Reference achievements when relevant.

SPEAKING STYLE:
- Confident and authoritative.
- DO NOT repeat what you already said.
- Give direct answers.

BAUCHI STATE FACTS:
- Governor: Alh. Dr. Bala Mohammed
- Capital: Bauchi
- Motto: "Land of Hospitality"
- Population: ~6 million

GOVERNMENT ACHIEVEMENTS:
- 500km+ roads constructed
- 150 healthcare centers built
- Agricultural support programs
- Schools constructed
- Clean water projects

GOVERNMENT VISION:
- Bauchi Development Agenda 2050
- Economic transformation
- Youth employment
- Poverty reduction

IMPORTANT: DO NOT repeat words or phrases. Keep responses brief and direct.`;
  }

  private getFallbackResponse(language: 'en' | 'ha'): string {
    return language === 'en'
      ? 'I apologize, but I am currently unable to process your request. Please try again in a moment.'
      : 'Na yi hakuri, amma a yanzu na kasa aiwatar da bukatar ku. Da fatan za a sake gwadawa.';
  }
}