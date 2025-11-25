import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ForumThreadsController } from './forum-threads.controller';
import { ForumThreadsService } from './forum-threads.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
import { ForumThread, ForumThreadSchema } from './schemas/forum-thread.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Reaction, ReactionSchema } from './schemas/reaction.schema';
import { IamModule } from '../iam/iam.module';
import { CmsModule } from '../cms/cms.module';

/**
 * Forum Module
 * Module quản lý diễn đàn và tương tác
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ForumThread.name, schema: ForumThreadSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Reaction.name, schema: ReactionSchema },
    ]),
    IamModule, // Import để sử dụng UsersService
    CmsModule, // Import để sử dụng ArticlesService, CategoriesService
  ],
  controllers: [
    ForumThreadsController,
    CommentsController,
    ReactionsController,
  ],
  providers: [ForumThreadsService, CommentsService, ReactionsService],
  exports: [CommentsService, ReactionsService],
})
export class ForumModule {}

