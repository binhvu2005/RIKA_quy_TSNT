import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { Category, CategorySchema } from './schemas/category.schema';
import { Article, ArticleSchema } from './schemas/article.schema';
import { Bookmark, BookmarkSchema } from './schemas/bookmark.schema';
import { IamModule } from '../iam/iam.module';
import { ForumModule } from '../forum/forum.module';

/**
 * CMS Module (Content Management System)
 * Module quản lý tin tức và nội dung
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Article.name, schema: ArticleSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
    ]),
    IamModule, // Import để sử dụng UsersService
    forwardRef(() => ForumModule), // Import để sử dụng ForumThreadsService (dùng forwardRef để tránh circular dependency)
  ],
  controllers: [CategoriesController, ArticlesController, BookmarksController],
  providers: [CategoriesService, ArticlesService, BookmarksService],
  exports: [CategoriesService, ArticlesService, BookmarksService],
})
export class CmsModule {}

