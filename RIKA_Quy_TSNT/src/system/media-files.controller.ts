import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
import { MediaFilesService } from './media-files.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Media Files Controller
 * Xử lý các HTTP request liên quan đến Media File
 */
@Controller('media/files')
@UseGuards(JwtAuthGuard)
export class MediaFilesController {
  constructor(private readonly mediaFilesService: MediaFilesService) {}

  /**
   * Upload file
   * POST /media/files/upload
   * TODO: Implement file upload logic
   */
  @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination?: string;
      filename?: string;
      path?: string;
      buffer?: Buffer;
    },
    @Body('description') description: string,
    @CurrentUser() user: any,
  ) {
    // TODO: Implement file upload to storage (S3, local, etc.)
    // Tạm thời chỉ tạo record
    return this.mediaFilesService.create(
      {
        url: file.path || file.filename || '',
        original_name: file.originalname,
        type: file.mimetype,
        size: file.size,
        description,
      },
      user._id.toString(),
    );
  }

  /**
   * Lấy danh sách media files
   * GET /media/files?page=1&limit=20&uploader_id=xxx&type=image/png
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('uploader_id') uploaderId?: string,
    @Query('type') type?: string,
  ) {
    return this.mediaFilesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      uploaderId,
      type,
    );
  }

  /**
   * Lấy media file theo ID
   * GET /media/files/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.mediaFilesService.findOne(id);
  }

  /**
   * Xóa media file
   * DELETE /media/files/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.mediaFilesService.remove(id);
  }
}

