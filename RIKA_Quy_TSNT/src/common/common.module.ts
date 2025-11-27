import { Module } from '@nestjs/common';
import { ProfanityFilterService } from './services/profanity-filter.service';
import { ExcelService } from './services/excel.service';

/**
 * Common Module
 * Module chứa các service và utilities dùng chung
 */
@Module({
  providers: [ProfanityFilterService, ExcelService],
  exports: [ProfanityFilterService, ExcelService],
})
export class CommonModule {}

