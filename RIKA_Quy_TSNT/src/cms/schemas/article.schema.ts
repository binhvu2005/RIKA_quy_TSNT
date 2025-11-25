import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Schema cho Author Snapshot (Embedded Document)
 * Lưu cứng thông tin tác giả để giảm lookup
 */
@Schema({ _id: false })
export class AuthorSnapshot {
  /** ID tác giả - Reference đến users */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  _id: Types.ObjectId;

  /** Tên hiển thị của tác giả */
  @Prop({ type: String, required: true })
  name: string;

  /** Avatar của tác giả */
  @Prop({ type: String })
  avatar?: string;
}

/**
 * Schema cho Stats (Embedded Document)
 * Thống kê bài viết - Counter pattern
 */
@Schema({ _id: false })
export class ArticleStats {
  /** Số lượt xem */
  @Prop({ type: Number, default: 0 })
  views: number;

  /** Số lượt like */
  @Prop({ type: Number, default: 0 })
  likes: number;

  /** Số lượt comment */
  @Prop({ type: Number, default: 0 })
  comments: number;
}

/**
 * Article Document Type
 */
export type ArticleDocument = Article & Document;

/**
 * Article Schema
 * Collection: articles
 * Công dụng: Lưu trữ bài viết tin tức
 */
@Schema({ timestamps: true })
export class Article {
  /** Tiêu đề bài viết - Text Index cho search */
  @Prop({ type: String, required: true, trim: true, index: 'text' })
  title: string;

  /** Đường dẫn tĩnh (slug) - Unique */
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  slug: string;

  /** Nội dung HTML */
  @Prop({ type: String, required: true })
  content: string;

  /** Ảnh đại diện */
  @Prop({ type: String })
  thumbnail?: string;

  /** Thông tin tác giả - Snapshot pattern */
  @Prop({ type: AuthorSnapshot, required: true })
  author: AuthorSnapshot;

  /** Danh mục - Reference đến categories */
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category: Types.ObjectId;

  /** Thẻ bài viết - Index */
  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  /** Trạng thái bài viết */
  @Prop({
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true,
  })
  status: string;

  /** Thống kê - Counter pattern */
  @Prop({ type: ArticleStats, default: () => ({}) })
  stats: ArticleStats;

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Article Schema từ class
 */
export const ArticleSchema = SchemaFactory.createForClass(Article);

// Index cho tìm kiếm
ArticleSchema.index({ title: 'text', content: 'text' }); // Text search
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ category: 1, status: 1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ 'author._id': 1 });
ArticleSchema.index({ createdAt: -1 }); // Sort mới nhất

