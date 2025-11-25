import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

/**
 * Fund Document Type
 */
export type FundDocument = Fund & Document;

/**
 * Fund Schema
 * Collection: funds
 * Công dụng: Quản lý các ví tiền/sổ quỹ
 */
@Schema({ timestamps: true })
export class Fund {
  /** Tên quỹ */
  @Prop({ type: String, required: true, trim: true })
  name: string;

  /** Số dư hiện tại - Sử dụng Decimal128 để đảm bảo độ chính xác */
  @Prop({
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    default: 0,
    get: (value: mongoose.Types.Decimal128) => {
      return value ? parseFloat(value.toString()) : 0;
    },
  })
  balance: mongoose.Types.Decimal128;

  /** Đơn vị tiền tệ */
  @Prop({ type: String, default: 'VND', uppercase: true })
  currency: string;

  /** Số tài khoản ngân hàng */
  @Prop({ type: String, trim: true })
  account_num?: string;

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Fund Schema từ class
 */
export const FundSchema = SchemaFactory.createForClass(Fund);

// Index
FundSchema.index({ name: 1 });
FundSchema.index({ account_num: 1 });

