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
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

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
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [
    SystemSettingsController,
    MediaFilesController,
    AuditLogsController,
    NotificationsController,
  ],
  providers: [
    SystemSettingsService,
    MediaFilesService,
    AuditLogsService,
    NotificationsService,
  ],
  exports: [
    SystemSettingsService,
    MediaFilesService,
    AuditLogsService,
    NotificationsService,
  ],
})
export class SystemModule {}

