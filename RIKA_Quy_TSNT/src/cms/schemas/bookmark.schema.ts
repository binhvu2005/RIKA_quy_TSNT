import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Bookmark Document Type
 */
export type BookmarkDocument = Bookmark & Document;

/**
 * Bookmark Schema
 * Collection: bookmarks
 * Công dụng: Lưu trữ các bài viết/thread được user bookmark
 */
@Schema({ timestamps: true })
export class Bookmark {
  /** Người dùng - Reference đến users */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  /** Loại đối tượng được bookmark - Polymorphic */
  @Prop({
    type: String,
    enum: ['Article', 'ForumThread'],
    required: true,
    index: true,
  })
  target_model: string;

  /** ID đối tượng được bookmark - Polymorphic Reference */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  target_id: Types.ObjectId;

  /** Ngày tạo */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Bookmark Schema từ class
 */
export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

// Compound index để đảm bảo mỗi user chỉ bookmark 1 lần cho mỗi target
BookmarkSchema.index({ user_id: 1, target_model: 1, target_id: 1 }, { unique: true });

