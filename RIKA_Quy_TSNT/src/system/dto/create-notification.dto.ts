import { IsString, IsEnum, IsMongoId, IsOptional, IsObject, IsBoolean } from 'class-validator';

/**
 * DTO cho việc tạo notification
 */
export class CreateNotificationDto {
  /** ID người nhận */
  @IsMongoId({ message: 'ID người nhận không hợp lệ' })
  user_id: string;

  /** Loại thông báo */
  @IsEnum([
    'comment',
    'reply',
    'like',
    'mention',
    'article_approved',
    'article_rejected',
    'scholarship_approved',
    'scholarship_rejected',
    'contribution_approved',
    'contribution_rejected',
    'system',
  ], {
    message: 'Loại thông báo không hợp lệ',
  })
  type: string;

  /** Tiêu đề */
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  title: string;

  /** Nội dung */
  @IsString({ message: 'Nội dung phải là chuỗi' })
  message: string;

  /** Link liên quan */
  @IsOptional()
  @IsString()
  link?: string;

  /** Dữ liệu bổ sung */
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

