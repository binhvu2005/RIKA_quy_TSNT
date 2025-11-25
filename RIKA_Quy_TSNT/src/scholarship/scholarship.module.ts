import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScholarshipsController } from './scholarships.controller';
import { ScholarshipsService } from './scholarships.service';
import { ScholarshipApplicationsController } from './scholarship-applications.controller';
import { ScholarshipApplicationsService } from './scholarship-applications.service';
import { Scholarship, ScholarshipSchema } from './schemas/scholarship.schema';
import {
  ScholarshipApplication,
  ScholarshipApplicationSchema,
} from './schemas/scholarship-application.schema';

/**
 * Scholarship Module
 * Module quản lý học bổng
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Scholarship.name, schema: ScholarshipSchema },
      {
        name: ScholarshipApplication.name,
        schema: ScholarshipApplicationSchema,
      },
    ]),
  ],
  controllers: [ScholarshipsController, ScholarshipApplicationsController],
  providers: [ScholarshipsService, ScholarshipApplicationsService],
  exports: [ScholarshipsService, ScholarshipApplicationsService],
})
export class ScholarshipModule {}

