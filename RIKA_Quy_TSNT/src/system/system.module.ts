import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsService } from './system-settings.service';
import { MediaFilesController } from './media-files.controller';
import { MediaFilesService } from './media-files.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { SystemSetting, SystemSettingSchema } from './schemas/system-setting.schema';
import { MediaFile, MediaFileSchema } from './schemas/media-file.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';

/**
 * System Module
 * Module quản lý hệ thống
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemSetting.name, schema: SystemSettingSchema },
      { name: MediaFile.name, schema: MediaFileSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [
    SystemSettingsController,
    MediaFilesController,
    AuditLogsController,
  ],
  providers: [
    SystemSettingsService,
    MediaFilesService,
    AuditLogsService,
  ],
  exports: [
    SystemSettingsService,
    MediaFilesService,
    AuditLogsService,
  ],
})
export class SystemModule {}

