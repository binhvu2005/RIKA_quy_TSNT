import {
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  MinLength,
} from 'class-validator';

/**
 * DTO cho việc tạo category mới
 */
export class CreateCategoryDto {
  /** Tên danh mục */
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  @MinLength(2, { message: 'Tên danh mục phải có ít nhất 2 ký tự' })
  name: string;

  /** Đường dẫn tĩnh (slug) - tự động tạo nếu không có */
  @IsOptional()
  @IsString()
  slug?: string;

  /** Loại danh mục */
  @IsOptional()
  @IsEnum(['news', 'forum', 'document'], {
    message: 'Loại danh mục phải là: news, forum hoặc document',
  })
  type?: string;

  /** ID danh mục cha */
  @IsOptional()
  @IsMongoId({ message: 'ID danh mục cha không hợp lệ' })
  parent_id?: string;
}

