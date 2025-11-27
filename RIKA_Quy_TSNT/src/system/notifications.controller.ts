import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Notifications Controller
 * Xử lý các HTTP request liên quan đến Notification
 */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Tạo notification mới (Admin/System)
   * POST /notifications
   * Yêu cầu quyền: admin, editor
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  /**
   * Lấy danh sách notifications của user hiện tại
   * GET /notifications?isRead=false&page=1&limit=20
   * Yêu cầu: Authentication
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findByUser(
    @Query('isRead') isRead?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: any,
  ) {
    const isReadBool = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
    return this.notificationsService.findByUser(
      user._id.toString(),
      isReadBool,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  /**
   * Đánh dấu notification là đã đọc
   * PATCH /notifications/:id/read
   * Yêu cầu: Authentication
   */
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user._id.toString());
  }

  /**
   * Đánh dấu tất cả notifications là đã đọc
   * PATCH /notifications/read-all
   * Yêu cầu: Authentication
   */
  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@CurrentUser() user: any) {
    const count = await this.notificationsService.markAllAsRead(user._id.toString());
    return { count, message: `Đã đánh dấu ${count} thông báo là đã đọc` };
  }

  /**
   * Xóa notification
   * DELETE /notifications/:id
   * Yêu cầu: Authentication
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.notificationsService.remove(id, user._id.toString());
  }

  /**
   * Xóa tất cả notifications đã đọc
   * DELETE /notifications/read
   * Yêu cầu: Authentication
   */
  @Delete('read')
  @UseGuards(JwtAuthGuard)
  async removeAllRead(@CurrentUser() user: any) {
    const count = await this.notificationsService.removeAllRead(user._id.toString());
    return { count, message: `Đã xóa ${count} thông báo đã đọc` };
  }
}

