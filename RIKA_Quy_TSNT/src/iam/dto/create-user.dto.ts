import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * DTO cho việc tạo user mới
 */
export class CreateUserDto {
  /** Tên đăng nhập */
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username chỉ được chứa chữ cái, số và dấu gạch dưới',
  })
  username: string;

  /** Email */
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  /** Mật khẩu */
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  /** Danh sách quyền */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  /** Trạng thái */
  @IsOptional()
  @IsEnum(['active', 'banned', 'pending'], {
    message: 'Trạng thái phải là: active, banned hoặc pending',
  })
  status?: string;

  /** Họ và tên */
  @IsOptional()
  @IsString()
  full_name?: string;

  /** Số điện thoại */
  @IsOptional()
  @IsString()
  phone?: string;

  /** Số CCCD/CMND */
  @IsOptional()
  @IsString()
  identity?: string;
}

