import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from './cloudinary.module';

/**
 * Upload Module
 * Module xử lý upload file
 */
@Module({
  imports: [CloudinaryModule],
  controllers: [UploadController],
})
export class UploadModule {}

