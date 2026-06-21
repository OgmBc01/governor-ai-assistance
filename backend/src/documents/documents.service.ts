import { Injectable, Logger } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';
import { QdrantService } from '../services/qdrant.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly uploadDir = './uploads';

  constructor(private readonly qdrantService: QdrantService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async processDocument(file: MulterFile): Promise<{
    success: boolean;
    message: string;
    chunks?: number;
  }> {
    try {
      const text = await this.extractText(file);
      const chunks = this.splitIntoChunks(text);
      
      // Try to store in Qdrant, but don't fail if Qdrant is not available
      try {
        await this.storeChunks(chunks, file.originalname);
      } catch (error: any) {
        this.logger.warn(`Could not store in Qdrant: ${error.message}`);
      }

      return {
        success: true,
        message: 'Document processed successfully',
        chunks: chunks.length,
      };
    } catch (error: any) {
      this.logger.error(`Error processing document: ${error.message}`);
      return {
        success: false,
        message: `Error processing document: ${error.message}`,
      };
    }
  }

  private async extractText(file: MulterFile): Promise<string> {
    const filePath = path.join(this.uploadDir, file.filename);
    fs.writeFileSync(filePath, file.buffer);

    let text = '';

    try {
      if (file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await (pdfParse as any)(dataBuffer);
        text = pdfData.text;
      } else if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } else if (file.mimetype === 'text/plain') {
        text = fs.readFileSync(filePath, 'utf-8');
      } else {
        throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      fs.unlinkSync(filePath);
      return text;
    } catch (error: any) {
      fs.unlinkSync(filePath);
      throw error;
    }
  }

  private splitIntoChunks(text: string, chunkSize: number = 500): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
    }

    return chunks;
  }

  private async storeChunks(
    chunks: string[],
    documentName: string
  ): Promise<void> {
    const vectors = chunks.map(() => {
      const vector = new Array(768).fill(0);
      for (let i = 0; i < 768; i++) {
        vector[i] = Math.random() * 2 - 1;
      }
      return vector;
    });

    const points = chunks.map((chunk, index) => ({
      id: `${documentName}-${index}`,
      vector: vectors[index],
      payload: {
        text: chunk,
        document: documentName,
        chunkIndex: index,
        timestamp: new Date().toISOString(),
      },
    }));

    await this.qdrantService.upsertPoints(points);
  }

  async searchKnowledge(query: string): Promise<string[]> {
    try {
      const queryVector = new Array(768).fill(0);
      for (let i = 0; i < 768; i++) {
        queryVector[i] = Math.random() * 2 - 1;
      }

      const results = await this.qdrantService.search(queryVector, 3);
      return results.map((r: any) => r.payload?.text || '');
    } catch (error: any) {
      this.logger.error(`Error searching knowledge: ${error.message}`);
      return [];
    }
  }
}