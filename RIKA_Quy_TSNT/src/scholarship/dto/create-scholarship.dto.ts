import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
  IsEnum,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO cho Criteria
 */
export class CriteriaDto {
  /** Mã tiêu chí */
  @IsString()
  key: string;

  /** Tên tiêu chí */
  @IsString()
  name: string;

  /** Trọng số (%) */
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  /** Mô tả */
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO cho việc tạo scholarship
 */
export class CreateScholarshipDto {
  /** Tên đợt học bổng */
  @IsString()
  name: string;

  /** Ngân sách dự kiến */
  @IsNumber()
  @Min(0)
  budget: number;

  /** Cấu hình tiêu chí */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriteriaDto)
  criteria?: CriteriaDto[];

  /** Mô tả */
  @IsOptional()
  @IsString()
  description?: string;

  /** Ngày bắt đầu */
  @IsOptional()
  @IsDateString()
  start_date?: string;

  /** Ngày kết thúc */
  @IsOptional()
  @IsDateString()
  end_date?: string;

  /** Trạng thái */
  @IsOptional()
  @IsEnum(['draft', 'open', 'closed', 'completed'])
  status?: string;
}

