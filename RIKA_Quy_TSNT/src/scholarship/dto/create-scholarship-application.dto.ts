import { IsMongoId, IsOptional, IsObject } from 'class-validator';

/**
 * DTO cho việc tạo scholarship application
 */
export class CreateScholarshipApplicationDto {
  /** ID đợt học bổng */
  @IsMongoId()
  scholarship_id: string;

  /** Dữ liệu form động */
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

