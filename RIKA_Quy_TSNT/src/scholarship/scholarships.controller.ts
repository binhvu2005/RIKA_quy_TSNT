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
import { ScholarshipsService } from './scholarships.service';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

/**
 * Scholarships Controller
 * Xử lý các HTTP request liên quan đến Scholarship
 */
@Controller('scholarships')
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  /**
   * Tạo scholarship mới
   * POST /scholarships
   * Yêu cầu quyền: admin
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createScholarshipDto: CreateScholarshipDto) {
    return this.scholarshipsService.create(createScholarshipDto);
  }

  /**
   * Lấy danh sách scholarships với phân trang và filter
   * GET /scholarships?page=1&limit=10&search=keyword&status=open
   * Public endpoint (nhưng chỉ hiển thị open nếu không có quyền admin)
   */
  @Get()
  @Public()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.scholarshipsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status,
    );
  }

  /**
   * Lấy scholarship theo ID
   * GET /scholarships/:id
   * Public endpoint
   */
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.scholarshipsService.findOne(id);
  }

  /**
   * Cập nhật scholarship
   * PATCH /scholarships/:id
   * Yêu cầu quyền: admin
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateScholarshipDto>,
  ) {
    return this.scholarshipsService.update(id, updateData);
  }

  /**
   * Xóa scholarship
   * DELETE /scholarships/:id
   * Yêu cầu quyền: admin
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.scholarshipsService.remove(id);
  }
}

