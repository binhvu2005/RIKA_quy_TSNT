import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

/**
 * Reactions Controller
 * Xử lý các HTTP request liên quan đến Reaction
 */
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  /**
   * Tạo hoặc cập nhật reaction
   * POST /reactions
   * Yêu cầu authentication
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrUpdate(
    @Body() createReactionDto: CreateReactionDto,
    @CurrentUser() user: any,
  ) {
    return this.reactionsService.createOrUpdate(
      createReactionDto,
      user._id.toString(),
    );
  }

  /**
   * Lấy danh sách reactions của một đối tượng
   * GET /reactions?target_model=Article&target_id=xxx
   * Public endpoint
   */
  @Get()
  @Public()
  async findByTarget(
    @Query('target_model') targetModel: string,
    @Query('target_id') targetId: string,
  ) {
    return this.reactionsService.findByTarget(targetModel, targetId);
  }

  /**
   * Kiểm tra user đã react chưa
   * GET /reactions/check?target_model=Article&target_id=xxx
   * Yêu cầu authentication
   */
  @Get('check')
  @UseGuards(JwtAuthGuard)
  async findByUserAndTarget(
    @Query('target_model') targetModel: string,
    @Query('target_id') targetId: string,
    @CurrentUser() user: any,
  ) {
    return this.reactionsService.findByUserAndTarget(
      targetModel,
      targetId,
      user._id.toString(),
    );
  }

  /**
   * Xóa reaction
   * DELETE /reactions/:id
   * Yêu cầu authentication
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.reactionsService.remove(id, user._id.toString());
  }
}

