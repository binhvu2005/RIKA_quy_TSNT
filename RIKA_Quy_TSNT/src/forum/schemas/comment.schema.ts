import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuthorSnapshot } from '../../cms/schemas/article.schema';

/**
 * Comment Document Type
 */
export type CommentDocument = Comment & Document;

/**
 * Comment Schema
 * Collection: comments
 * Công dụng: Lưu bình luận cho cả Tin tức và Diễn đàn (Polymorphic)
 */
@Schema({ timestamps: true })
export class Comment {
  /** Thông tin user comment - Snapshot pattern */
  @Prop({ type: AuthorSnapshot, required: true })
  user: AuthorSnapshot;

  /** Nội dung comment */
  @Prop({ type: String, required: true, trim: true })
  content: string;

  /** Loại đối tượng được comment - Polymorphic */
  @Prop({
    type: String,
    enum: ['Article', 'ForumThread'],
    required: true,
    index: true,
  })
  target_model: string;

  /** ID đối tượng được comment - Polymorphic Reference */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  target_id: Types.ObjectId;

  /** ID comment cha - Dùng để trả lời (Reply) */
  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null, index: true })
  parent_id?: Types.ObjectId;

  /** Trạng thái duyệt */
  @Prop({ type: Boolean, default: false, index: true })
  is_approved: boolean;

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Comment Schema từ class
 */
export const CommentSchema = SchemaFactory.createForClass(Comment);

// Index cho tìm kiếm
CommentSchema.index({ target_model: 1, target_id: 1 });
CommentSchema.index({ parent_id: 1 });
CommentSchema.index({ is_approved: 1, createdAt: -1 });
CommentSchema.index({ 'user._id': 1 });

