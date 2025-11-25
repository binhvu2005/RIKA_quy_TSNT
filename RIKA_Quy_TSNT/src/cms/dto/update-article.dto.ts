import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';

/**
 * DTO cho việc cập nhật article
 * Tất cả các field đều optional
 */
export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

