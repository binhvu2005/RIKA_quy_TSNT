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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

/**
 * Categories Controller
 * Xử lý các HTTP request liên quan đến Category
 */
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Tạo category mới
   * POST /categories
   * Yêu cầu quyền: admin, editor
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * Lấy danh sách categories dạng cây
   * GET /categories?type=news
   * Public endpoint
   */
  @Get()
  @Public()
  async findAll(@Query('type') type?: string) {
    return this.categoriesService.findAll(type);
  }

  /**
   * Lấy category theo ID
   * GET /categories/:id
   * Public endpoint
   */
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  /**
   * Lấy category theo slug
   * GET /categories/slug/:slug
   * Public endpoint
   */
  @Get('slug/:slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * Cập nhật category
   * PATCH /categories/:id
   * Yêu cầu quyền: admin, editor
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * Xóa category
   * DELETE /categories/:id
   * Yêu cầu quyền: admin
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
  }
}

