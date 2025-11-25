import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Media File Document Type
 */
export type MediaFileDocument = MediaFile & Document;

/**
 * Media File Schema
 * Collection: media_files
 * Công dụng: Quản lý tập trung file upload
 */
@Schema({ timestamps: true })
export class MediaFile {
  /** Đường dẫn file */
  @Prop({ type: String, required: true })
  url: string;

  /** Tên file gốc */
  @Prop({ type: String, required: true })
  original_name: string;

  /** Loại file (MIME type) */
  @Prop({ type: String, required: true, index: true })
  type: string;

  /** Kích thước file (bytes) */
  @Prop({ type: Number })
  size?: number;

  /** Người upload - Reference đến users */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  uploader: Types.ObjectId;

  /** Mô tả */
  @Prop({ type: String })
  description?: string;

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Media File Schema từ class
 */
export const MediaFileSchema = SchemaFactory.createForClass(MediaFile);

// Index
MediaFileSchema.index({ uploader: 1, createdAt: -1 });
MediaFileSchema.index({ type: 1 });

