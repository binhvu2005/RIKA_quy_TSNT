import {
  IsString,
  IsEnum,
  IsMongoId,
  IsOptional,
  MinLength,
} from 'class-validator';

/**
 * DTO cho việc tạo comment mới
 */
export class CreateCommentDto {
  /** Nội dung comment */
  @IsString({ message: 'Nội dung phải là chuỗi' })
  @MinLength(1, { message: 'Nội dung không được để trống' })
  content: string;

  /** Loại đối tượng được comment */
  @IsEnum(['Article', 'ForumThread'], {
    message: 'Loại đối tượng phải là Article hoặc ForumThread',
  })
  target_model: string;

  /** ID đối tượng được comment */
  @IsMongoId({ message: 'ID đối tượng không hợp lệ' })
  target_id: string;

  /** ID comment cha (nếu là reply) */
  @IsOptional()
  @IsMongoId({ message: 'ID comment cha không hợp lệ' })
  parent_id?: string;
}

