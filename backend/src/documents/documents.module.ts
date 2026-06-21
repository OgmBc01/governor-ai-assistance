import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { QdrantService } from '../services/qdrant.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, QdrantService],
  exports: [DocumentsService],
})
export class DocumentsModule {}