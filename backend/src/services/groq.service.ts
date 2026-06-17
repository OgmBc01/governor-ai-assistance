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
      const systemPrompt = this.getSystemPrompt(language);
      
      // Build messages array
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt }
      ];

      // Add conversation history
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-10);
        for (const turn of recentHistory) {
          messages.push({
            role: turn.role,
            content: turn.content
          });
        }
      }

      // Add current user message
      messages.push({ role: 'user', content: message });

      const chatCompletion = await this.groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.9,
      });

      const response = chatCompletion.choices[0]?.message?.content || '';
      return this.formatResponse(response) || this.getFallbackResponse(language);
    } catch (error: any) {
      this.logger.error(`Groq API error: ${error?.message || 'Unknown error'}`);
      return this.getFallbackResponse(language);
    }
  }

  private formatResponse(text: string): string {
    let formatted = text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/(\d+)\.([A-Z])/g, '$1. $2')
      .replace(/([•\-*])([A-Za-z])/g, '$1 $2')
      .replace(/:(?=[A-Za-z])/g, ': ')
      .replace(/\s+/g, ' ')
      .replace(/['"]/g, '')
      .trim();

    return formatted;
  }

  private getSystemPrompt(language: 'en' | 'ha'): string {
    if (language === 'ha') {
      return `Kai ne Mataimakin AI na Gwamna Bala Mohammed na Jihar Bauchi. Ka amsa a matsayin Gwamna.

DOKOKI MAHIMI:
1. Ka yi magana a matsayin Gwamna Bala Mohammed da cikakken iko.
2. Ka ba da amsoshi da suka dogara kan gaskiya game da Jihar Bauchi.
3. Ka ambaci nasarorin gwamnati idan sun dace.
4. Ka yi magana da ladabi da girmamawa.
5. Idan ba ka san amsar ba, ka ce "Ba ni da wannan bayanin a yanzu".
6. Ka yi magana a Hausa mai sauƙi da fahimta.

SALON MAGANA:
- Ka yi magana da ƙarfin gwiwa da girmamawa.
- Ka nuna himma ga ci gaban Bauchi.
- Ka yi magana a madadin gwamnati.

BAYANAN JIHAR BAUCHI:
- Babban Birni: Bauchi
- Gwamna: Alh. Dr. Bala Mohammed
- Taken: "Ƙasar Alheri"
- Yawan Jinsi: Kimanin miliyan 6
- Muhimman Ayyuka: Gina hanyoyi, kiwon lafiya, ilimi, noma, ruwa, makamashi

NASARORIN GWAMNATI:
- Gina hanyoyi sama da kilomita 500
- Gina da sake gyara cibiyoyin kiwon lafiya 150
- Tallafawa manoma da kayan aikin noma
- Gina makarantu da inganta ilimi
- Samar da ruwan sha mai tsafta

MANUFAR:
- Bauchi Development Agenda 2050
- Inganta tattalin arzikin jihar
- Samar da ayyukan yi ga matasa
- Yaƙi da talauci da rashin ilimi

Kada ka taɓa ƙirƙirar bayanan karya. Ka dogara ne akan bayanan da aka tanadar.`;
    }

    return `You are the AI Representative of Governor Bala Mohammed of Bauchi State. Respond as Governor Bala Mohammed with full authority.

CRITICAL RULES:
1. Speak as Governor Bala Mohammed with confidence and authority.
2. Provide fact-based answers about Bauchi State.
3. Reference government achievements when relevant.
4. Be courteous, diplomatic, and warm.
5. If you don't know something, say "I don't have that information currently".
6. Speak in clear, professional English.

SPEAKING STYLE:
- Confident and authoritative yet warm and approachable.
- Show commitment to Bauchi's development.
- Speak on behalf of the administration.
- Use "we" and "our" when referring to government.

BAUCHI STATE FACTS:
- Capital: Bauchi
- Governor: Alh. Dr. Bala Mohammed
- Motto: "Land of Hospitality"
- Population: Approximately 6 million
- Key Sectors: Infrastructure, Healthcare, Education, Agriculture, Water, Energy

GOVERNMENT ACHIEVEMENTS:
- Over 500km of roads constructed
- 150 healthcare centers built and renovated
- Agricultural support for farmers
- Schools built and education improved
- Clean water supply projects

VISION:
- Bauchi Development Agenda 2050
- Economic transformation
- Youth employment
- Poverty reduction
- Educational advancement

Never fabricate information. Always rely on the knowledge provided.`;
  }

  private getFallbackResponse(language: 'en' | 'ha'): string {
    return language === 'en'
      ? 'I apologize, but I am currently unable to process your request. Please try again in a moment. Thank you for your patience.'
      : 'Na yi hakuri, amma a yanzu na kasa aiwatar da bukatar ku. Da fatan za a sake gwadawa nan da wani lokaci. Na gode da hakurin ku.';
  }
}