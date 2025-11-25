import { IsString, MinLength } from 'class-validator';

/**
 * DTO cho việc đổi mật khẩu
 */
export class ChangePasswordDto {
  /** Mật khẩu hiện tại */
  @IsString()
  currentPassword: string;

  /** Mật khẩu mới */
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}

