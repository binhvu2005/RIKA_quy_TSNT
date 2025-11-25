import { IsString, IsMongoId, IsOptional, MinLength } from 'class-validator';

/**
 * DTO cho việc tạo forum thread mới
 */
export class CreateForumThreadDto {
  /** Tiêu đề Thread */
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  @MinLength(5, { message: 'Tiêu đề phải có ít nhất 5 ký tự' })
  title: string;

  /** Nội dung */
  @IsString({ message: 'Nội dung phải là chuỗi' })
  @MinLength(10, { message: 'Nội dung phải có ít nhất 10 ký tự' })
  content: string;

  /** ID chuyên mục */
  @IsMongoId({ message: 'ID chuyên mục không hợp lệ' })
  category: string;

  /** Ghim bài */
  @IsOptional()
  is_sticky?: boolean;
}

