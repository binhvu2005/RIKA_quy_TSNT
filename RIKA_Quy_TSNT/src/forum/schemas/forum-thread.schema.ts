import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuthorSnapshot } from '../../cms/schemas/article.schema';

/**
 * Schema cho Forum Thread Stats (Embedded Document)
 */
@Schema({ _id: false })
export class ForumThreadStats {
  /** Số lượng reply */
  @Prop({ type: Number, default: 0 })
  replies_count: number;

  /** Số lượt xem */
  @Prop({ type: Number, default: 0 })
  views_count: number;
}

/**
 * Forum Thread Document Type
 */
export type ForumThreadDocument = ForumThread & Document;

/**
 * Forum Thread Schema
 * Collection: forum_threads
 * Công dụng: Các chủ đề thảo luận trên diễn đàn
 */
@Schema({ timestamps: true })
export class ForumThread {
  /** Tiêu đề Thread */
  @Prop({ type: String, required: true, trim: true, index: 'text' })
  title: string;

  /** Nội dung */
  @Prop({ type: String, required: true })
  content: string;

  /** Thông tin tác giả - Snapshot pattern */
  @Prop({ type: AuthorSnapshot, required: true })
  author: AuthorSnapshot;

  /** Chuyên mục - Reference đến categories */
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category: Types.ObjectId;

  /** Ghim bài */
  @Prop({ type: Boolean, default: false, index: true })
  is_sticky: boolean;

  /** Thời gian trả lời cuối - Dùng để sort Thread */
  @Prop({ type: Date, default: Date.now, index: true })
  last_reply_at: Date;

  /** Thống kê */
  @Prop({ type: ForumThreadStats, default: () => ({}) })
  stats: ForumThreadStats;

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Forum Thread Schema từ class
 */
export const ForumThreadSchema = SchemaFactory.createForClass(ForumThread);

// Index cho tìm kiếm
ForumThreadSchema.index({ title: 'text', content: 'text' }); // Text search
ForumThreadSchema.index({ category: 1, is_sticky: -1, last_reply_at: -1 });
ForumThreadSchema.index({ 'author._id': 1 });
ForumThreadSchema.index({ createdAt: -1 });

