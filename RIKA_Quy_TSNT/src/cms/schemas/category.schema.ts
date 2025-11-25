import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Category Document Type
 */
export type CategoryDocument = Category & Document;

/**
 * Category Schema
 * Collection: categories
 * Công dụng: Cây thư mục phân loại nội dung, hỗ trợ đa cấp
 */
@Schema({ timestamps: true })
export class Category {
  /** Tên danh mục */
  @Prop({ type: String, required: true, trim: true })
  name: string;

  /** Đường dẫn tĩnh (slug) - Unique, Index */
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  slug: string;

  /** Loại danh mục */
  @Prop({
    type: String,
    enum: ['news', 'forum', 'document'],
    default: 'news',
  })
  type: string;

  /** Danh mục cha - Reference đến categories */
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parent_id?: Types.ObjectId;

  /** Danh sách tổ tiên - Dùng để query cây thư mục nhanh */
  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  ancestors: Types.ObjectId[];

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Category Schema từ class
 */
export const CategorySchema = SchemaFactory.createForClass(Category);

// Index cho tìm kiếm
CategorySchema.index({ slug: 1, type: 1 });
CategorySchema.index({ parent_id: 1 });
CategorySchema.index({ ancestors: 1 });

