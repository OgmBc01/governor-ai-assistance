import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [ChatModule, DocumentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}