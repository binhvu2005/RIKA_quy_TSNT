import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

/**
 * Schema cho Criteria (Embedded Document)
 * Cấu hình tiêu chí chấm điểm
 */
@Schema({ _id: false })
export class Criteria {
  /** Mã tiêu chí - VD: gpa, essay, interview */
  @Prop({ type: String, required: true })
  key: string;

  /** Tên tiêu chí */
  @Prop({ type: String, required: true })
  name: string;

  /** Trọng số (%) */
  @Prop({ type: Number, required: true, min: 0, max: 100 })
  weight: number;

  /** Mô tả */
  @Prop({ type: String })
  description?: string;
}

/**
 * Scholarship Document Type
 */
export type ScholarshipDocument = Scholarship & Document;

/**
 * Scholarship Schema
 * Collection: scholarships
 * Công dụng: Các đợt mở xét tuyển học bổng
 */
@Schema({ timestamps: true })
export class Scholarship {
  /** Tên đợt học bổng */
  @Prop({ type: String, required: true, trim: true })
  name: string;

  /** Ngân sách dự kiến - Sử dụng Decimal128 */
  @Prop({
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (value: mongoose.Types.Decimal128) => {
      return value ? parseFloat(value.toString()) : 0;
    },
  })
  budget: mongoose.Types.Decimal128;

  /** Số lượng học bổng */
  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  /** Cấu hình tiêu chí chấm điểm - Embedded Config */
  @Prop({ type: [Criteria], default: [] })
  criteria: Criteria[];

  /** Mô tả */
  @Prop({ type: String })
  description?: string;

  /** Ngày bắt đầu nhận hồ sơ */
  @Prop({ type: Date })
  start_date?: Date;

  /** Ngày kết thúc nhận hồ sơ */
  @Prop({ type: Date })
  end_date?: Date;

  /** Trạng thái */
  @Prop({
    type: String,
    enum: ['draft', 'open', 'closed', 'completed'],
    default: 'draft',
    index: true,
  })
  status: string;

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Scholarship Schema từ class
 */
export const ScholarshipSchema = SchemaFactory.createForClass(Scholarship);

// Index
ScholarshipSchema.index({ status: 1, start_date: 1, end_date: 1 });
ScholarshipSchema.index({ name: 'text' }); // Text search

