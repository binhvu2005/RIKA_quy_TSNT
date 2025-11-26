import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * DTO cho việc yêu cầu đặt lại mật khẩu
 */
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;
}

