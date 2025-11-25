import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

/**
 * Audit Log Document Type
 */
export type AuditLogDocument = AuditLog & Document;

/**
 * Audit Log Schema
 * Collection: audit_logs
 * Công dụng: Lưu vết hành động hệ thống
 */
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class AuditLog {
  /** Người thực hiện - Reference đến users */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  actor: Types.ObjectId;

  /** Hành động */
  @Prop({
    type: String,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'other'],
    required: true,
    index: true,
  })
  action: string;

  /** Tên collection/bảng bị tác động */
  @Prop({ type: String, required: true, index: true })
  collection: string;

  /** ID dòng bị tác động */
  @Prop({ type: Types.ObjectId, index: true })
  target_id?: Types.ObjectId;

  /** Thay đổi - { old: ..., new: ... } */
  @Prop({ type: mongoose.Schema.Types.Mixed })
  changes?: any;

  /** IP address */
  @Prop({ type: String })
  ip_address?: string;

  /** User agent */
  @Prop({ type: String })
  user_agent?: string;

  /** Ngày tạo - TTL Index: Tự xóa sau 1 năm */
  created_at?: Date;
}

/**
 * Tạo Audit Log Schema từ class
 */
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Index
AuditLogSchema.index({ actor: 1, created_at: -1 });
AuditLogSchema.index({ collection: 1, target_id: 1 });
AuditLogSchema.index({ action: 1, created_at: -1 });

// TTL Index - Tự xóa sau 1 năm (365 ngày)
AuditLogSchema.index({ created_at: 1 }, { expireAfterSeconds: 31536000 });

