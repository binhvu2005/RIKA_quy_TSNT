import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

/**
 * Comments Controller
 * Xử lý các HTTP request liên quan đến Comment
 */
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Tạo comment mới
   * POST /comments
   * Yêu cầu authentication
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.create(createCommentDto, user._id.toString());
  }

  /**
   * Lấy danh sách comments của một đối tượng
   * GET /comments?target_model=Article&target_id=xxx&page=1&limit=20
   * Public endpoint
   */
  @Get()
  @Public()
  async findByTarget(
    @Query('target_model') targetModel: string,
    @Query('target_id') targetId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.findByTarget(
      targetModel,
      targetId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  /**
   * Lấy comment theo ID
   * GET /comments/:id
   * Public endpoint
   */
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  /**
   * Cập nhật comment
   * PATCH /comments/:id
   * Yêu cầu authentication
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.update(id, content, user._id.toString());
  }

  /**
   * Xóa comment
   * DELETE /comments/:id
   * Yêu cầu authentication
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.commentsService.remove(id, user._id.toString());
  }

  /**
   * Duyệt comment (approve)
   * POST /comments/:id/approve
   * Yêu cầu quyền: admin, editor
   */
  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  async approve(@Param('id') id: string) {
    await this.commentsService.approve(id);
  }

  /**
   * Từ chối comment (reject)
   * POST /comments/:id/reject
   * Yêu cầu quyền: admin, editor
   */
  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  async reject(@Param('id') id: string) {
    await this.commentsService.reject(id);
  }
}

