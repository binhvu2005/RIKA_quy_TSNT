import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Reaction Document Type
 */
export type ReactionDocument = Reaction & Document;

/**
 * Reaction Schema
 * Collection: reactions
 * Công dụng: Lưu lượt Like/Tim/Haha (Polymorphic)
 */
@Schema({ timestamps: true })
export class Reaction {
  /** Người thả cảm xúc - Reference đến users */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  /** Loại cảm xúc */
  @Prop({
    type: String,
    enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
    default: 'like',
    index: true,
  })
  type: string;

  /** Loại đối tượng được react - Polymorphic */
  @Prop({
    type: String,
    enum: ['Article', 'ForumThread', 'Comment'],
    required: true,
    index: true,
  })
  target_model: string;

  /** ID đối tượng được react - Polymorphic Reference */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  target_id: Types.ObjectId;

  /** Ngày tạo */
  createdAt?: Date;
}

/**
 * Tạo Reaction Schema từ class
 */
export const ReactionSchema = SchemaFactory.createForClass(Reaction);

// Index unique để tránh user react nhiều lần cùng một đối tượng
ReactionSchema.index({ user_id: 1, target_model: 1, target_id: 1 }, { unique: true });
ReactionSchema.index({ target_model: 1, target_id: 1, type: 1 });

