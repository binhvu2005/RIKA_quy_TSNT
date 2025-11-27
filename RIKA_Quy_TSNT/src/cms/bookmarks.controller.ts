import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Bookmarks Controller
 * Xử lý các HTTP request liên quan đến Bookmark
 */
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  /**
   * Tạo bookmark mới
   * POST /bookmarks
   * Yêu cầu: Authentication
   */
  @Post()
  async create(
    @Body() createBookmarkDto: CreateBookmarkDto,
    @CurrentUser() user: any,
  ) {
    return this.bookmarksService.create(createBookmarkDto, user._id.toString());
  }

  /**
   * Xóa bookmark
   * DELETE /bookmarks/:targetModel/:targetId
   * Yêu cầu: Authentication
   */
  @Delete(':targetModel/:targetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('targetModel') targetModel: string,
    @Param('targetId') targetId: string,
    @CurrentUser() user: any,
  ) {
    await this.bookmarksService.remove(targetModel, targetId, user._id.toString());
  }

  /**
   * Kiểm tra đã bookmark chưa
   * GET /bookmarks/check/:targetModel/:targetId
   * Yêu cầu: Authentication
   */
  @Get('check/:targetModel/:targetId')
  async check(
    @Param('targetModel') targetModel: string,
    @Param('targetId') targetId: string,
    @CurrentUser() user: any,
  ) {
    const isBookmarked = await this.bookmarksService.isBookmarked(
      targetModel,
      targetId,
      user._id.toString(),
    );
    return { isBookmarked };
  }

  /**
   * Lấy danh sách bookmarks của user
   * GET /bookmarks?targetModel=Article&page=1&limit=20
   * Yêu cầu: Authentication
   */
  @Get()
  async findByUser(
    @Query('targetModel') targetModel?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: any,
  ) {
    return this.bookmarksService.findByUser(
      user._id.toString(),
      targetModel,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }
}

