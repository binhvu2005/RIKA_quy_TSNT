import { IsString, IsEmail, IsOptional } from 'class-validator';

/**
 * DTO cho việc đăng nhập
 */
export class LoginDto {
  /** Email hoặc username */
  @IsString({ message: 'Email hoặc username là bắt buộc' })
  username_or_email: string;

  /** Mật khẩu */
  @IsString({ message: 'Mật khẩu là bắt buộc' })
  password: string;
}

