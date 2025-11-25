import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

/**
 * DTO cho việc tạo reaction
 */
export class CreateReactionDto {
  /** Loại cảm xúc */
  @IsOptional()
  @IsEnum(['like', 'love', 'haha', 'wow', 'sad', 'angry'], {
    message: 'Loại cảm xúc không hợp lệ',
  })
  type?: string;

  /** Loại đối tượng được react */
  @IsEnum(['Article', 'ForumThread', 'Comment'], {
    message: 'Loại đối tượng phải là Article, ForumThread hoặc Comment',
  })
  target_model: string;

  /** ID đối tượng được react */
  @IsMongoId({ message: 'ID đối tượng không hợp lệ' })
  target_id: string;
}

