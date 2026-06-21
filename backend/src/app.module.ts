import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { DocumentsModule } from './documents/documents.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [ChatModule, DocumentsModule, AuthModule, AdminModule],
  controllers: [],
  providers: [],
})
export class AppModule {}