import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

/**
 * Schema cho Review (Embedded Document)
 * Kết quả chấm điểm
 */
@Schema({ _id: false })
export class Review {
  /** Điểm số tổng */
  @Prop({ type: Number, min: 0, max: 100 })
  score?: number;

  /** Điểm chi tiết theo từng tiêu chí */
  @Prop({ type: Map, of: Number })
  criteria_scores?: Map<string, number>;

  /** Nhận xét của giám khảo */
  @Prop({ type: String })
  note?: string;

  /** Người chấm */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewer_id?: Types.ObjectId;

  /** Ngày chấm */
  @Prop({ type: Date })
  reviewed_at?: Date;
}

/**
 * Scholarship Application Document Type
 */
export type ScholarshipApplicationDocument = ScholarshipApplication & Document;

/**
 * Scholarship Application Schema
 * Collection: scholarship_applications
 * Công dụng: Đơn ứng tuyển của sinh viên - Schema linh hoạt (Flexible)
 */
@Schema({ timestamps: true })
export class ScholarshipApplication {
  /** Đợt học bổng - Reference đến scholarships */
  @Prop({ type: Types.ObjectId, ref: 'Scholarship', required: true, index: true })
  scholarship_id: Types.ObjectId;

  /** Người nộp đơn - Reference đến users */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  /** Trạng thái */
  @Prop({
    type: String,
    enum: [
      'submitted',
      'under_review',
      'approved',
      'rejected',
      'awarded',
    ],
    default: 'submitted',
    index: true,
  })
  status: string;

  /** Dữ liệu form động - Flexible Schema */
  @Prop({ type: Map, of: mongoose.Schema.Types.Mixed })
  data?: Map<string, any>;

  /** Kết quả chấm - Embedded Document */
  @Prop({ type: Review })
  review?: Review;

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Scholarship Application Schema từ class
 */
export const ScholarshipApplicationSchema = SchemaFactory.createForClass(
  ScholarshipApplication,
);

// Index
ScholarshipApplicationSchema.index({ scholarship_id: 1, user_id: 1 }, { unique: true });
ScholarshipApplicationSchema.index({ status: 1, createdAt: -1 });
ScholarshipApplicationSchema.index({ 'review.score': -1 }); // Sort theo điểm

