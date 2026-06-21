import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { QdrantService } from '../services/qdrant.service';

// Define the file type locally
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

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly qdrantService: QdrantService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadDocument(@UploadedFile() file: MulterFile) {
    if (!file) {
      return {
        success: false,
        message: 'No file uploaded',
      };
    }

    return this.documentsService.processDocument(file);
  }

  @Get('search/:query')
  async searchDocuments(@Param('query') query: string) {
    const results = await this.documentsService.searchKnowledge(query);
    return {
      success: true,
      results,
    };
  }

  @Get('status')
  async getStatus() {
    const info = await this.qdrantService.getCollectionInfo();
    return {
      success: true,
      status: 'connected',
      collection: info,
    };
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  async clearDocuments() {
    await this.qdrantService.deleteCollection();
    return {
      success: true,
      message: 'Knowledge base cleared',
    };
  }
}