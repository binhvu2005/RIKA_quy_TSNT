import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Schema cho Profile (Embedded Document)
 * Profile được nhúng trực tiếp trong User để tối ưu hiệu năng đọc
 */
@Schema({ _id: false })
export class UserProfile {
  /** Họ và tên đầy đủ */
  @Prop({ type: String, trim: true })
  full_name?: string;

  /** URL ảnh đại diện */
  @Prop({ type: String })
  avatar?: string;

  /** Số điện thoại */
  @Prop({ type: String, trim: true })
  phone?: string;

  /** Số CCCD/CMND - Dùng cho module Tài chính */
  @Prop({ type: String, trim: true })
  identity?: string;
}

/**
 * Schema cho Social Auth (Embedded Document)
 * Lưu thông tin đăng nhập qua mạng xã hội
 */
@Schema({ _id: false })
export class SocialAuth {
  /** Tên provider (google, facebook, github, ...) */
  @Prop({ type: String, required: true })
  provider: string;

  /** ID từ provider */
  @Prop({ type: String, required: true })
  provider_id: string;

  /** Email từ provider */
  @Prop({ type: String })
  email?: string;
}

/**
 * User Document Type
 */
export type UserDocument = User & Document;

/**
 * User Schema
 * Collection: users
 * Công dụng: Lưu trữ thông tin đăng nhập và hồ sơ cá nhân
 */
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class User {
  /** Tên đăng nhập - Unique, Index */
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  })
  username: string;

  /** Email - Unique, Index */
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  email: string;

  /** Hash mật khẩu - Ẩn mặc định khi query */
  @Prop({ type: String, required: true, select: false })
  password: string;

  /** Danh sách quyền - VD: ['admin', 'editor'] */
  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  /** Trạng thái tài khoản */
  @Prop({
    type: String,
    enum: ['active', 'banned', 'pending'],
    default: 'pending',
  })
  status: string;

  /** Profile được nhúng trực tiếp (Embedded Document) */
  @Prop({ type: UserProfile })
  profile?: UserProfile;

  /** Tài khoản mạng xã hội */
  @Prop({ type: [SocialAuth], default: [] })
  social_auth?: SocialAuth[];

  /** Ngày tạo - Tự động tạo bởi timestamps */
  created_at?: Date;
}

/**
 * Tạo User Schema từ class
 */
export const UserSchema = SchemaFactory.createForClass(User);

// Tạo index cho tìm kiếm
UserSchema.index({ username: 1, email: 1 });
UserSchema.index({ 'profile.full_name': 'text' }); // Text search

