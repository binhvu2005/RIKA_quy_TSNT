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
import { ScholarshipApplicationsService } from './scholarship-applications.service';
import { CreateScholarshipApplicationDto } from './dto/create-scholarship-application.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Scholarship Applications Controller
 * Xử lý các HTTP request liên quan đến Scholarship Application
 */
@Controller('scholarship-applications')
@UseGuards(JwtAuthGuard)
export class ScholarshipApplicationsController {
  constructor(
    private readonly applicationsService: ScholarshipApplicationsService,
  ) {}

  /**
   * Tạo application mới
   * POST /scholarship-applications
   */
  @Post()
  async create(
    @Body() createApplicationDto: CreateScholarshipApplicationDto,
    @CurrentUser() user: any,
  ) {
    return this.applicationsService.create(
      createApplicationDto,
      user._id.toString(),
    );
  }

  /**
   * Lấy danh sách applications với phân trang và filter
   * GET /scholarship-applications?page=1&limit=20&scholarship_id=xxx&user_id=xxx&status=submitted
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('scholarship_id') scholarshipId?: string,
    @Query('user_id') userId?: string,
    @Query('status') status?: string,
    @CurrentUser() user?: any,
  ) {
    // Nếu không phải admin thì chỉ lấy đơn của chính user đó
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('editor');
    const finalUserId = isAdmin ? userId : user._id.toString();

    return this.applicationsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      scholarshipId,
      finalUserId,
      status,
    );
  }

  /**
   * Lấy application theo ID
   * GET /scholarship-applications/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const application = await this.applicationsService.findOne(id);
    
    // Kiểm tra quyền (chỉ user nộp đơn hoặc admin mới xem được)
    const isAdmin = user.roles?.includes('admin') || user.roles?.includes('editor');
    const isOwner = application.user_id.toString() === user._id.toString();
    
    if (!isAdmin && !isOwner) {
      throw new Error('Bạn không có quyền xem đơn này');
    }

    return application;
  }

  /**
   * Cập nhật application
   * PATCH /scholarship-applications/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateScholarshipApplicationDto>,
    @CurrentUser() user: any,
  ) {
    return this.applicationsService.update(
      id,
      updateData,
      user._id.toString(),
    );
  }

  /**
   * Chấm điểm application
   * POST /scholarship-applications/:id/review
   * Yêu cầu quyền: admin, editor
   */
  @Post(':id/review')
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  async review(
    @Param('id') id: string,
    @Body() reviewData: { criteria_scores?: Record<string, number>; note?: string },
    @CurrentUser() user: any,
  ) {
    return this.applicationsService.review(
      id,
      reviewData,
      user._id.toString(),
    );
  }

  /**
   * Cập nhật trạng thái application
   * PATCH /scholarship-applications/:id/status
   * Yêu cầu quyền: admin
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.applicationsService.updateStatus(id, status as any);
  }

  /**
   * Xóa application
   * DELETE /scholarship-applications/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.applicationsService.remove(id, user._id.toString());
  }
}

