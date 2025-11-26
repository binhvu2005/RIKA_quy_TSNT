import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * OTP Schema
 * Collection: otps
 * Công dụng: Lưu trữ mã OTP để đặt lại mật khẩu
 */
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Otp {
  /** Email của người dùng */
  @Prop({ type: String, required: true, index: true })
  email: string;

  /** Mã OTP */
  @Prop({ type: String, required: true })
  code: string;

  /** Thời gian hết hạn */
  @Prop({ type: Date, required: true, index: { expireAfterSeconds: 0 } })
  expires_at: Date;

  /** Trạng thái sử dụng */
  @Prop({ type: Boolean, default: false })
  used: boolean;

  /** Ngày tạo - Tự động tạo bởi timestamps */
  created_at?: Date;
}

/**
 * Tạo OTP Schema từ class
 */
export const OtpSchema = SchemaFactory.createForClass(Otp);

// Tạo TTL index để tự động xóa OTP hết hạn
OtpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Tạo index cho email và used để tìm kiếm nhanh
OtpSchema.index({ email: 1, used: 1 });

/**
 * OTP Document Type
 */
export type OtpDocument = Otp & Document;

