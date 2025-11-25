import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

/**
 * System Settings Controller
 * Xử lý các HTTP request liên quan đến System Setting
 */
@Controller('system/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  /**
   * Tạo hoặc cập nhật setting
   * POST /system/settings
   */
  @Post()
  async set(
    @Body('key') key: string,
    @Body('value') value: any,
    @Body('group') group?: string,
    @Body('description') description?: string,
  ) {
    return this.settingsService.set(key, value, group, description);
  }

  /**
   * Lấy setting theo key
   * GET /system/settings/:key
   */
  @Get(':key')
  async get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  /**
   * Lấy tất cả settings theo group
   * GET /system/settings/group/:group
   */
  @Get('group/:group')
  async getByGroup(@Param('group') group: string) {
    return this.settingsService.getByGroup(group);
  }

  /**
   * Lấy tất cả settings
   * GET /system/settings
   */
  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  /**
   * Xóa setting
   * DELETE /system/settings/:key
   */
  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('key') key: string) {
    await this.settingsService.remove(key);
  }
}

