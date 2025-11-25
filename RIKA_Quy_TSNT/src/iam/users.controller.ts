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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Users Controller
 * Xử lý các HTTP request liên quan đến User
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Tạo user mới
   * POST /users
   * Yêu cầu quyền: admin
   */
  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Lấy danh sách users với phân trang và filter
   * GET /users?page=1&limit=10&search=keyword&status=active
   * Yêu cầu quyền: admin, editor
   */
  @Get()
  @Roles('admin', 'editor')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status,
    );
  }

  /**
   * Lấy thông tin user hiện tại
   * GET /users/me
   */
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user._id.toString());
  }

  /**
   * Lấy thông tin user theo ID
   * GET /users/:id
   * Yêu cầu quyền: admin, editor
   */
  @Get(':id')
  @Roles('admin', 'editor')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Cập nhật user
   * PATCH /users/:id
   * Yêu cầu quyền: admin hoặc chính user đó
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    // Chỉ admin mới có thể cập nhật user khác
    if (id !== currentUser._id.toString() && !currentUser.roles.includes('admin')) {
      throw new Error('Bạn không có quyền cập nhật user này');
    }
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Đổi mật khẩu
   * PATCH /users/:id/change-password
   * Yêu cầu quyền: chính user đó
   */
  @Patch(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: any,
  ) {
    // Chỉ user đó mới có thể đổi mật khẩu của mình
    if (id !== currentUser._id.toString()) {
      throw new Error('Bạn không có quyền đổi mật khẩu của user này');
    }
    return this.usersService.changePassword(id, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }

  /**
   * Xóa user (soft delete)
   * DELETE /users/:id
   * Yêu cầu quyền: admin
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }

  /**
   * Xuất danh sách users ra Excel
   * GET /users/export/excel
   * Yêu cầu quyền: admin
   */
  @Get('export/excel')
  @Roles('admin')
  async exportToExcel(@Query() filters: any) {
    // TODO: Implement export
    return this.usersService.exportToExcel(filters);
  }

  /**
   * Nhập danh sách users từ Excel
   * POST /users/import/excel
   * Yêu cầu quyền: admin
   */
  @Post('import/excel')
  @Roles('admin')
  async importFromExcel(@Body() file: any) {
    // TODO: Implement import
    return this.usersService.importFromExcel(file);
  }
}

