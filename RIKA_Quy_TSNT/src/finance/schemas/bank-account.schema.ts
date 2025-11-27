import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Bank Account Document Type
 */
export type BankAccountDocument = BankAccount & Document;

/**
 * Bank Account Schema
 * Collection: bank_accounts
 * Công dụng: Quản lý tài khoản ngân hàng để nhận đóng góp
 */
@Schema({ timestamps: true })
export class BankAccount {
  /** Tên ngân hàng */
  @Prop({ type: String, required: true, trim: true })
  bank_name: string;

  /** Số tài khoản */
  @Prop({ type: String, required: true, trim: true })
  account_number: string;

  /** Tên chủ tài khoản */
  @Prop({ type: String, required: true, trim: true })
  account_holder: string;

  /** URL ảnh QR code */
  @Prop({ type: String })
  qr_code_url?: string;

  /** Trạng thái (active/inactive) */
  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  })
  status: string;

  /** Ghi chú */
  @Prop({ type: String })
  note?: string;

  /** Ngày tạo và cập nhật */
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tạo Bank Account Schema từ class
 */
export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);

// Index
BankAccountSchema.index({ bank_name: 1, account_number: 1 });
BankAccountSchema.index({ status: 1 });

