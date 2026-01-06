import { Controller, Post, Get, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PdfParserService } from './pdf-parser.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(
    @InjectRepository(Transaction) private repo: Repository<Transaction>,
    private pdfService: PdfParserService
  ) {}

  @UseGuards(JwtAuthGuard) // Protegido para Vue 3
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const data = await this.pdfService.parse(file.buffer);
    return await this.repo.save(data); // Carga masiva a MySQL
  }

  @Get() // Endpoint para que Power BI consuma el JSON
  async findAll() {
    return await this.repo.find();
  }
}