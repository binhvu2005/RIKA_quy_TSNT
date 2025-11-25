import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

/**
 * DTO cho việc cập nhật category
 * Tất cả các field đều optional
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

