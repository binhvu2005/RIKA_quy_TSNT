import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';

/**
 * DTO cho việc tạo bank account
 */
export class CreateBankAccountDto {
  /** Tên ngân hàng */
  @IsString({ message: 'Tên ngân hàng phải là chuỗi' })
  @MinLength(2, { message: 'Tên ngân hàng phải có ít nhất 2 ký tự' })
  bank_name: string;

  /** Số tài khoản */
  @IsString({ message: 'Số tài khoản phải là chuỗi' })
  @MinLength(8, { message: 'Số tài khoản phải có ít nhất 8 ký tự' })
  account_number: string;

  /** Tên chủ tài khoản */
  @IsString({ message: 'Tên chủ tài khoản phải là chuỗi' })
  @MinLength(2, { message: 'Tên chủ tài khoản phải có ít nhất 2 ký tự' })
  account_holder: string;

  /** URL ảnh QR code */
  @IsOptional()
  @IsString()
  qr_code_url?: string;

  /** Trạng thái */
  @IsOptional()
  @IsEnum(['active', 'inactive'], {
    message: 'Trạng thái phải là active hoặc inactive',
  })
  status?: string;

  /** Ghi chú */
  @IsOptional()
  @IsString()
  note?: string;
}

