import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO cho việc tạo fund mới
 */
export class CreateFundDto {
  /** Tên quỹ */
  @IsString({ message: 'Tên quỹ phải là chuỗi' })
  name: string;

  /** Số dư ban đầu */
  @IsOptional()
  @IsNumber({}, { message: 'Số dư phải là số' })
  @Min(0, { message: 'Số dư không được âm' })
  @Transform(({ value }) => parseFloat(value))
  balance?: number;

  /** Đơn vị tiền tệ */
  @IsOptional()
  @IsString()
  currency?: string;

  /** Số tài khoản ngân hàng */
  @IsOptional()
  @IsString()
  account_num?: string;
}

