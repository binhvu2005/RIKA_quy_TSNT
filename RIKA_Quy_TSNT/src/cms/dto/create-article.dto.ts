import {
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsArray,
  MinLength,
} from 'class-validator';

/**
 * DTO cho việc tạo article mới
 */
export class CreateArticleDto {
  /** Tiêu đề bài viết */
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  @MinLength(5, { message: 'Tiêu đề phải có ít nhất 5 ký tự' })
  title: string;

  /** Đường dẫn tĩnh (slug) - tự động tạo nếu không có */
  @IsOptional()
  @IsString()
  slug?: string;

  /** Nội dung HTML */
  @IsString({ message: 'Nội dung phải là chuỗi' })
  @MinLength(10, { message: 'Nội dung phải có ít nhất 10 ký tự' })
  content: string;

  /** Ảnh đại diện */
  @IsOptional()
  @IsString()
  thumbnail?: string;

  /** ID danh mục */
  @IsMongoId({ message: 'ID danh mục không hợp lệ' })
  category: string;

  /** Thẻ bài viết */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  /** Trạng thái */
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], {
    message: 'Trạng thái phải là: draft, published hoặc archived',
  })
  status?: string;
}

