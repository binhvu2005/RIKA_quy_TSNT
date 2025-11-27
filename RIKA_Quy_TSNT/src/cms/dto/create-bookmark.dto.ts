import { IsString, IsEnum, IsMongoId } from 'class-validator';

/**
 * DTO cho việc tạo bookmark
 */
export class CreateBookmarkDto {
  /** Loại đối tượng */
  @IsEnum(['Article', 'ForumThread'], {
    message: 'Loại đối tượng phải là Article hoặc ForumThread',
  })
  target_model: string;

  /** ID đối tượng */
  @IsMongoId({ message: 'ID đối tượng không hợp lệ' })
  target_id: string;
}

