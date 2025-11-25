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
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

/**
 * Articles Controller
 * Xử lý các HTTP request liên quan đến Article
 */
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * Tạo article mới
   * POST /articles
   * Yêu cầu quyền: admin, editor
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: any,
  ) {
    return this.articlesService.create(createArticleDto, user._id.toString());
  }

  /**
   * Lấy danh sách articles với phân trang và filter
   * GET /articles?page=1&limit=10&search=keyword&category=id&status=published&tags=tag1,tag2
   * Public endpoint (nhưng chỉ trả về published nếu không có quyền admin)
   */
  @Get()
  @Public()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('tags') tags?: string,
    @CurrentUser() user?: any,
  ) {
    // Nếu không phải admin/editor thì chỉ lấy published
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('editor');
    const finalStatus = isAdmin ? status : 'published';

    const tagsArray = tags ? tags.split(',') : undefined;

    return this.articlesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      category,
      finalStatus,
      tagsArray,
    );
  }

  /**
   * Lấy article theo ID
   * GET /articles/:id
   * Public endpoint
   */
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id, true); // Tăng lượt xem
  }

  /**
   * Lấy article theo slug
   * GET /articles/slug/:slug
   * Public endpoint
   */
  @Get('slug/:slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug, true); // Tăng lượt xem
  }

  /**
   * Cập nhật article
   * PATCH /articles/:id
   * Yêu cầu quyền: admin, editor hoặc chính tác giả
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor', 'user')
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: any,
  ) {
    return this.articlesService.update(id, updateArticleDto, user._id.toString());
  }

  /**
   * Xóa article
   * DELETE /articles/:id
   * Yêu cầu quyền: admin hoặc chính tác giả
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor', 'user')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.articlesService.remove(id, user._id.toString());
  }
}

