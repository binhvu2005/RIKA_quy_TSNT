import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Category, CategorySchema } from './schemas/category.schema';
import { Article, ArticleSchema } from './schemas/article.schema';
import { IamModule } from '../iam/iam.module';

/**
 * CMS Module (Content Management System)
 * Module quản lý tin tức và nội dung
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Article.name, schema: ArticleSchema },
    ]),
    IamModule, // Import để sử dụng UsersService
  ],
  controllers: [CategoriesController, ArticlesController],
  providers: [CategoriesService, ArticlesService],
  exports: [CategoriesService, ArticlesService],
})
export class CmsModule {}

