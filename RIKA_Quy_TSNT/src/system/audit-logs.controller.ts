import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

/**
 * Audit Logs Controller
 * Xử lý các HTTP request liên quan đến Audit Log
 */
@Controller('system/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  /**
   * Lấy danh sách audit logs
   * GET /system/audit-logs?page=1&limit=50&actor_id=xxx&action=update&collection=users
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('actor_id') actorId?: string,
    @Query('action') action?: string,
    @Query('collection') collection?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.auditLogsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      actorId,
      action,
      collection,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Lấy audit logs của một đối tượng
   * GET /system/audit-logs/target/:collection/:targetId
   */
  @Get('target/:collection/:targetId')
  async findByTarget(
    @Param('collection') collection: string,
    @Param('targetId') targetId: string,
  ) {
    return this.auditLogsService.findByTarget(collection, targetId);
  }
}

