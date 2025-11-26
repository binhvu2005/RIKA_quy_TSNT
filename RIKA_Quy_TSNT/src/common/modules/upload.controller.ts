import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { Express } from 'express';

/**
 * Upload Controller
 * Xử lý upload ảnh lên Cloudinary
 */
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Upload ảnh đơn
   * POST /upload/image
   * Yêu cầu: Authentication (cả admin và user đều có thể upload)
   */
  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Không có file được tải lên');
    }

    // Tạo folder dựa trên role của user
    const folder = user.roles?.includes('admin')
      ? 'admin'
      : 'users';

    const imageUrl = await this.cloudinaryService.uploadImage(file, folder);

    return {
      message: 'Upload ảnh thành công',
      url: imageUrl,
    };
  }

  /**
   * Upload ảnh avatar
   * POST /upload/avatar
   * Yêu cầu: Authentication (cả admin và user đều có thể upload)
   */
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Không có file được tải lên');
    }

    // Upload vào folder avatars với tên file là user ID
    const folder = 'avatars';
    const imageUrl = await this.cloudinaryService.uploadImage(file, folder);

    return {
      message: 'Upload avatar thành công',
      url: imageUrl,
    };
  }
}

