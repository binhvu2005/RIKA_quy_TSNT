import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Notification Document Type
 */
export type NotificationDocument = Notification & Document;

/**
 * Notification Schema
 * Collection: notifications
 * Công dụng: Lưu trữ thông báo cho người dùng
 */
@Schema({ timestamps: true })
export class Notification {
  /** Người nhận - Reference đến users */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  /** Loại thông báo */
  @Prop({
    type: String,
    enum: [
      'comment',
      'reply',
      'like',
      'mention',
      'article_approved',
      'article_rejected',
      'scholarship_approved',
      'scholarship_rejected',
      'contribution_approved',
      'contribution_rejected',
      'system',
    ],
    required: true,
    index: true,
  })
  type: string;

  /** Tiêu đề thông báo */
  @Prop({ type: String, required: true })
  title: string;

  /** Nội dung thông báo */
  @Prop({ type: String, required: true })
  message: string;

  /** Link liên quan (optional) */
  @Prop({ type: String })
  link?: string;

  /** Đã đọc chưa */
  @Prop({ type: Boolean, default: false, index: true })
  is_read: boolean;

  /** Dữ liệu bổ sung (JSON) */
  @Prop({ type: Object })
  metadata?: {
    target_model?: string;
    target_id?: string;
    actor_id?: string;
    actor_name?: string;
    [key: string]: any;
  };

  /** Ngày tạo */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Notification Schema từ class
 */
export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Index
NotificationSchema.index({ user_id: 1, is_read: 1, createdAt: -1 });
NotificationSchema.index({ user_id: 1, createdAt: -1 });

