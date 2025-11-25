import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

/**
 * Schema cho Invoice (Embedded Document)
 * Thông tin hóa đơn được nhúng trực tiếp
 */
@Schema({ _id: false })
export class Invoice {
  /** URL ảnh hóa đơn */
  @Prop({ type: String })
  url?: string;

  /** Mã số thuế/Số hóa đơn */
  @Prop({ type: String, trim: true })
  code?: string;
}

/**
 * Schema cho Reference Object (Embedded Document)
 * Tham chiếu đến đối tượng nghiệp vụ khác
 */
@Schema({ _id: false })
export class ReferenceObject {
  /** Nguồn gốc - VD: ScholarshipApplication */
  @Prop({ type: String, required: true })
  model: string;

  /** ID nguồn gốc */
  @Prop({ type: Types.ObjectId, required: true })
  id: Types.ObjectId;
}

/**
 * Finance Transaction Document Type
 */
export type FinanceTransactionDocument = FinanceTransaction & Document;

/**
 * Finance Transaction Schema
 * Collection: finance_transactions
 * Công dụng: Nhật ký giao dịch thu/chi (Ledger)
 */
@Schema({ timestamps: true })
export class FinanceTransaction {
  /** Quỹ liên quan - Reference đến funds */
  @Prop({ type: Types.ObjectId, ref: 'Fund', required: true, index: true })
  fund_id: Types.ObjectId;

  /** Người thực hiện - Reference đến users */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  /** Loại giao dịch */
  @Prop({
    type: String,
    enum: ['income', 'expense'],
    required: true,
    index: true,
  })
  type: string;

  /** Số tiền - Sử dụng Decimal128 để đảm bảo độ chính xác */
  @Prop({
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (value: mongoose.Types.Decimal128) => {
      return value ? parseFloat(value.toString()) : 0;
    },
  })
  amount: mongoose.Types.Decimal128;

  /** Diễn giải */
  @Prop({ type: String, required: true, trim: true })
  desc: string;

  /** Trạng thái */
  @Prop({
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending',
    index: true,
  })
  status: string;

  /** Thông tin hóa đơn - Embedded Document */
  @Prop({ type: Invoice })
  invoice?: Invoice;

  /** Tham chiếu nghiệp vụ - Embedded Document */
  @Prop({ type: ReferenceObject })
  ref_obj?: ReferenceObject;

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Finance Transaction Schema từ class
 */
export const FinanceTransactionSchema =
  SchemaFactory.createForClass(FinanceTransaction);

// Index
FinanceTransactionSchema.index({ fund_id: 1, createdAt: -1 });
FinanceTransactionSchema.index({ user_id: 1, createdAt: -1 });
FinanceTransactionSchema.index({ type: 1, status: 1 });
FinanceTransactionSchema.index({ 'ref_obj.model': 1, 'ref_obj.id': 1 });

