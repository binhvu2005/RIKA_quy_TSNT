import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reaction, ReactionDocument } from './schemas/reaction.schema';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { ArticlesService } from '../cms/articles.service';
import { ForumThreadsService } from './forum-threads.service';
import { CommentsService } from './comments.service';

/**
 * Reactions Service
 * Xử lý logic nghiệp vụ liên quan đến Reaction
 */
@Injectable()
export class ReactionsService {
  constructor(
    @InjectModel(Reaction.name) private reactionModel: Model<ReactionDocument>,
    private articlesService: ArticlesService,
    private forumThreadsService: ForumThreadsService,
    private commentsService: CommentsService,
  ) {}

  /**
   * Tạo hoặc cập nhật reaction
   * @param createReactionDto - Dữ liệu tạo reaction
   * @param userId - ID user tạo reaction
   * @returns Reaction đã tạo/cập nhật
   */
  async createOrUpdate(
    createReactionDto: CreateReactionDto,
    userId: string,
  ): Promise<ReactionDocument | null> {
    // Kiểm tra đối tượng target tồn tại
    await this.validateTarget(
      createReactionDto.target_model,
      createReactionDto.target_id,
    );

    const type = createReactionDto.type || 'like';

    // Tìm reaction đã tồn tại
    const existingReaction = await this.reactionModel.findOne({
      user_id: userId,
      target_model: createReactionDto.target_model,
      target_id: createReactionDto.target_id,
    });

    if (existingReaction) {
      // Nếu cùng loại thì xóa (unlike)
      if (existingReaction.type === type) {
        await this.reactionModel.findByIdAndDelete(existingReaction._id);
        // Giảm like count nếu là Article
        if (createReactionDto.target_model === 'Article') {
          await this.articlesService.decrementLike(createReactionDto.target_id);
        }
        return null;
      } else {
        // Nếu khác loại thì cập nhật
        existingReaction.type = type;
        return existingReaction.save();
      }
    }

    // Tạo reaction mới
    const reaction = new this.reactionModel({
      ...createReactionDto,
      user_id: userId,
      type,
    });

    const savedReaction = await reaction.save();

    // Tăng like count nếu là Article
    if (createReactionDto.target_model === 'Article') {
      await this.articlesService.incrementLike(createReactionDto.target_id);
    }

    return savedReaction;
  }

  /**
   * Lấy danh sách reactions của một đối tượng
   * @param targetModel - Loại đối tượng
   * @param targetId - ID đối tượng
   * @returns Danh sách reactions theo type
   */
  async findByTarget(targetModel: string, targetId: string) {
    const reactions = await this.reactionModel
      .find({
        target_model: targetModel,
        target_id: targetId,
      })
      .populate('user_id', 'username profile')
      .exec();

    // Nhóm theo type
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.type]) {
        acc[reaction.type] = [];
      }
      acc[reaction.type].push(reaction);
      return acc;
    }, {} as Record<string, ReactionDocument[]>);

    return grouped;
  }

  /**
   * Kiểm tra user đã react chưa
   * @param targetModel - Loại đối tượng
   * @param targetId - ID đối tượng
   * @param userId - ID user
   * @returns Reaction nếu có, null nếu không
   */
  async findByUserAndTarget(
    targetModel: string,
    targetId: string,
    userId: string,
  ): Promise<ReactionDocument | null> {
    return this.reactionModel
      .findOne({
        user_id: userId,
        target_model: targetModel,
        target_id: targetId,
      })
      .exec();
  }

  /**
   * Xóa reaction
   * @param id - Reaction ID
   * @param userId - ID user thực hiện
   */
  async remove(id: string, userId: string): Promise<void> {
    const reaction = await this.reactionModel.findById(id);
    if (!reaction) {
      throw new NotFoundException(`Reaction với ID ${id} không tồn tại`);
    }

    // Kiểm tra quyền (chỉ user tạo reaction mới được xóa)
    if (reaction.user_id.toString() !== userId) {
      throw new ConflictException('Bạn không có quyền xóa reaction này');
    }

    // Giảm like count nếu là Article
    if (reaction.target_model === 'Article') {
      await this.articlesService.decrementLike(reaction.target_id.toString());
    }

    await this.reactionModel.findByIdAndDelete(id);
  }

  /**
   * Validate đối tượng target tồn tại
   * @param targetModel - Loại đối tượng
   * @param targetId - ID đối tượng
   */
  private async validateTarget(targetModel: string, targetId: string): Promise<void> {
    if (targetModel === 'Article') {
      await this.articlesService.findOne(targetId);
    } else if (targetModel === 'ForumThread') {
      await this.forumThreadsService.findOne(targetId);
    } else if (targetModel === 'Comment') {
      await this.commentsService.findOne(targetId);
    } else {
      throw new NotFoundException('Loại đối tượng không hợp lệ');
    }
  }
}

