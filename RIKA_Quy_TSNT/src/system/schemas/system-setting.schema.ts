import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

/**
 * System Setting Document Type
 */
export type SystemSettingDocument = SystemSetting & Document;

/**
 * System Setting Schema
 * Collection: system_settings
 * Công dụng: Lưu cấu hình key-value cho toàn trang
 */
@Schema({ timestamps: true })
export class SystemSetting {
  /** Khóa cấu hình - Unique */
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  })
  key: string;

  /** Giá trị - Mixed type (String, Number hoặc JSON) */
  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  value: any;

  /** Nhóm cấu hình */
  @Prop({
    type: String,
    enum: ['general', 'smtp', 'payment', 'social', 'other'],
    default: 'general',
    index: true,
  })
  group: string;

  /** Mô tả */
  @Prop({ type: String })
  description?: string;

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo System Setting Schema từ class
 */
export const SystemSettingSchema = SchemaFactory.createForClass(SystemSetting);

// Index
SystemSettingSchema.index({ key: 1 }, { unique: true });
SystemSettingSchema.index({ group: 1 });

