import {
  IsString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO cho Invoice
 */
export class InvoiceDto {
  /** URL ảnh hóa đơn */
  @IsOptional()
  @IsString()
  url?: string;

  /** Mã số thuế/Số hóa đơn */
  @IsOptional()
  @IsString()
  code?: string;
}

/**
 * DTO cho Reference Object
 */
export class ReferenceObjectDto {
  /** Nguồn gốc */
  @IsString()
  model: string;

  /** ID nguồn gốc */
  @IsMongoId()
  id: string;
}

/**
 * DTO cho việc tạo finance transaction
 */
export class CreateFinanceTransactionDto {
  /** ID quỹ */
  @IsMongoId({ message: 'ID quỹ không hợp lệ' })
  fund_id: string;

  /** Loại giao dịch */
  @IsEnum(['income', 'expense'], {
    message: 'Loại giao dịch phải là income hoặc expense',
  })
  type: string;

  /** Số tiền */
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(0.01, { message: 'Số tiền phải lớn hơn 0' })
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  /** Diễn giải */
  @IsString({ message: 'Diễn giải phải là chuỗi' })
  desc: string;

  /** Trạng thái */
  @IsOptional()
  @IsEnum(['pending', 'completed', 'rejected'], {
    message: 'Trạng thái phải là pending, completed hoặc rejected',
  })
  status?: string;

  /** Thông tin hóa đơn */
  @IsOptional()
  invoice?: InvoiceDto;

  /** Tham chiếu nghiệp vụ */
  @IsOptional()
  ref_obj?: ReferenceObjectDto;
}

