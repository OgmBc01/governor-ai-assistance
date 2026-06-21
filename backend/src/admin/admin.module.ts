import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DocumentsService } from '../documents/documents.service';
import { QdrantService } from '../services/qdrant.service';

@Module({
  controllers: [AdminController],
  providers: [DocumentsService, QdrantService],
})
export class AdminModule {}