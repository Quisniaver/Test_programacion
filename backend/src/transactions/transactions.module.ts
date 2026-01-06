import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { PdfParserService } from './pdf-parser.service';
import { Transaction } from './transaction.entity';

@Module({
  imports: [
  
    TypeOrmModule.forFeature([Transaction])
  ],
  controllers: [TransactionsController],
  providers: [PdfParserService],
  exports: [PdfParserService] 
})
export class TransactionsModule {}