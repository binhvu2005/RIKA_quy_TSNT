import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO cho việc cập nhật user
 * Kế thừa từ CreateUserDto nhưng tất cả các field đều optional
 * Và loại bỏ password (cập nhật password ở endpoint riêng)
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  /** URL ảnh đại diện */
  @IsOptional()
  @IsString()
  avatar?: string;
}

