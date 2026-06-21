import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from '../documents/documents.service';

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

// Mock data - in production use database
let ministries: any[] = [
  { id: 1, name: 'Ministry of Education', name_ha: 'Ma\'aikatar Ilimi', commissioner: 'Dr. Aliyu Tilde' },
  { id: 2, name: 'Ministry of Health', name_ha: 'Ma\'aikatar Lafiya', commissioner: 'Dr. Adamu Sani' },
  { id: 3, name: 'Ministry of Works', name_ha: 'Ma\'aikatar Ayyuka', commissioner: 'Arc. Ibrahim Galadima' },
  { id: 4, name: 'Ministry of Agriculture', name_ha: 'Ma\'aikatar Noma', commissioner: 'Alh. Muhammad Bello' },
];

let achievements: any[] = [
  { id: 1, title: '500km Roads Constructed', category: 'Infrastructure', year: 2024 },
  { id: 2, title: '150 Healthcare Centers Renovated', category: 'Health', year: 2024 },
  { id: 3, title: '1000 Farmers Supported', category: 'Agriculture', year: 2024 },
];

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ============ Dashboard Analytics ============
  @Get('analytics')
  async getAnalytics() {
    return {
      success: true,
      data: {
        totalDocuments: 0, // Will be from database
        totalMinistries: ministries.length,
        totalAchievements: achievements.length,
        recentActivity: [
          { action: 'Document uploaded', timestamp: new Date().toISOString() },
          { action: 'Ministry updated', timestamp: new Date().toISOString() },
        ],
        languageUsage: {
          english: 70,
          hausa: 30,
        },
        popularQuestions: [
          { question: 'What are the achievements of this administration?', count: 45 },
          { question: 'Tell me about healthcare projects', count: 32 },
          { question: 'What infrastructure projects are ongoing?', count: 28 },
        ],
      },
    };
  }

  // ============ Document Management ============
  @Post('documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: MulterFile) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    return this.documentsService.processDocument(file);
  }

  @Get('documents')
  async getDocuments() {
    return {
      success: true,
      data: [
        { id: 1, name: 'Bauchi Development Plan 2025.pdf', uploadedAt: new Date().toISOString() },
        { id: 2, name: 'Healthcare Strategy.docx', uploadedAt: new Date().toISOString() },
      ],
    };
  }

  @Delete('documents/:id')
  @HttpCode(HttpStatus.OK)
  async deleteDocument(@Param('id') id: string) {
    return { success: true, message: `Document ${id} deleted` };
  }

  // ============ Ministry Management ============
  @Get('ministries')
  async getMinistries() {
    return { success: true, data: ministries };
  }

  @Post('ministries')
  async createMinistry(@Body() body: any) {
    const newMinistry = { id: ministries.length + 1, ...body };
    ministries.push(newMinistry);
    return { success: true, data: newMinistry };
  }

  @Put('ministries/:id')
  async updateMinistry(@Param('id') id: string, @Body() body: any) {
    const index = ministries.findIndex(m => m.id === parseInt(id));
    if (index === -1) {
      return { success: false, message: 'Ministry not found' };
    }
    ministries[index] = { ...ministries[index], ...body };
    return { success: true, data: ministries[index] };
  }

  @Delete('ministries/:id')
  @HttpCode(HttpStatus.OK)
  async deleteMinistry(@Param('id') id: string) {
    ministries = ministries.filter(m => m.id !== parseInt(id));
    return { success: true, message: 'Ministry deleted' };
  }

  // ============ Achievement Management ============
  @Get('achievements')
  async getAchievements() {
    return { success: true, data: achievements };
  }

  @Post('achievements')
  async createAchievement(@Body() body: any) {
    const newAchievement = { id: achievements.length + 1, ...body };
    achievements.push(newAchievement);
    return { success: true, data: newAchievement };
  }

  @Put('achievements/:id')
  async updateAchievement(@Param('id') id: string, @Body() body: any) {
    const index = achievements.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
      return { success: false, message: 'Achievement not found' };
    }
    achievements[index] = { ...achievements[index], ...body };
    return { success: true, data: achievements[index] };
  }

  @Delete('achievements/:id')
  @HttpCode(HttpStatus.OK)
  async deleteAchievement(@Param('id') id: string) {
    achievements = achievements.filter(a => a.id !== parseInt(id));
    return { success: true, message: 'Achievement deleted' };
  }
}