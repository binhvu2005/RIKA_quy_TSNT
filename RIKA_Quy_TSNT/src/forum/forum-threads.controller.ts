import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ForumThreadsService } from './forum-threads.service';
import { CreateForumThreadDto } from './dto/create-forum-thread.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

/**
 * Forum Threads Controller
 * Xử lý các HTTP request liên quan đến Forum Thread
 */
@Controller('forum/threads')
export class ForumThreadsController {
  constructor(private readonly forumThreadsService: ForumThreadsService) {}

  /**
   * Tạo forum thread mới
   * POST /forum/threads
   * Yêu cầu authentication
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createForumThreadDto: CreateForumThreadDto,
    @CurrentUser() user: any,
  ) {
    return this.forumThreadsService.create(
      createForumThreadDto,
      user._id.toString(),
    );
  }

  /**
   * Lấy danh sách forum threads với phân trang và filter
   * GET /forum/threads?page=1&limit=10&search=keyword&category=id
   * Public endpoint
   */
  @Get()
  @Public()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.forumThreadsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      category,
    );
  }

  /**
   * Lấy forum thread theo ID
   * GET /forum/threads/:id
   * Public endpoint
   */
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.forumThreadsService.findOne(id, true); // Tăng lượt xem
  }

  /**
   * Cập nhật forum thread
   * PATCH /forum/threads/:id
   * Yêu cầu authentication
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateForumThreadDto>,
    @CurrentUser() user: any,
  ) {
    return this.forumThreadsService.update(id, updateData, user);
  }

  /**
   * Xóa forum thread
   * DELETE /forum/threads/:id
   * Yêu cầu authentication
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.forumThreadsService.remove(id, user);
  }
}

