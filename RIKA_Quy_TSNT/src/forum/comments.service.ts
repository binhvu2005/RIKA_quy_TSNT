import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from '../iam/users.service';
import { ArticlesService } from '../cms/articles.service';
import { ForumThreadsService } from './forum-threads.service';

/**
 * Comments Service
 * Xử lý logic nghiệp vụ liên quan đến Comment
 */
@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private usersService: UsersService,
    private articlesService: ArticlesService,
    private forumThreadsService: ForumThreadsService,
  ) {}

  /**
   * Tạo comment mới
   * @param createCommentDto - Dữ liệu tạo comment
   * @param userId - ID user tạo comment
   * @returns Comment đã tạo
   */
  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentDocument> {
    // Kiểm tra đối tượng target tồn tại
    if (createCommentDto.target_model === 'Article') {
      await this.articlesService.findOne(createCommentDto.target_id);
    } else if (createCommentDto.target_model === 'ForumThread') {
      await this.forumThreadsService.findOne(createCommentDto.target_id);
    } else {
      throw new BadRequestException('Loại đối tượng không hợp lệ');
    }

    // Kiểm tra parent comment nếu có
    if (createCommentDto.parent_id) {
      const parent = await this.commentModel.findById(createCommentDto.parent_id);
      if (!parent) {
        throw new NotFoundException('Comment cha không tồn tại');
      }
      // Đảm bảo parent comment cùng target
      if (
        parent.target_model !== createCommentDto.target_model ||
        parent.target_id.toString() !== createCommentDto.target_id
      ) {
        throw new BadRequestException('Comment cha không thuộc cùng đối tượng');
      }
    }

    // Lấy thông tin user để tạo user snapshot
    const user = await this.usersService.findOne(userId);

    // Tạo user snapshot
    const userSnapshot = {
      _id: user._id,
      name: user.profile?.full_name || user.username,
      avatar: user.profile?.avatar,
    };

    const comment = new this.commentModel({
      ...createCommentDto,
      user: userSnapshot,
      is_approved: true, // Tự động approve, có thể thay đổi logic sau
    });

    const savedComment = await comment.save();

    // Cập nhật số lượng comment của target
    if (createCommentDto.target_model === 'Article') {
      await this.articlesService.incrementComment(createCommentDto.target_id);
    } else if (createCommentDto.target_model === 'ForumThread') {
      await this.forumThreadsService.updateLastReplyAt(createCommentDto.target_id);
    }

    return savedComment;
  }

  /**
   * Lấy danh sách comments của một đối tượng
   * @param targetModel - Loại đối tượng
   * @param targetId - ID đối tượng
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @returns Danh sách comments và metadata phân trang
   */
  async findByTarget(
    targetModel: string,
    targetId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const query = {
      target_model: targetModel,
      target_id: targetId,
      is_approved: true,
    };

    const [comments, total] = await Promise.all([
      this.commentModel
        .find(query)
        .sort({ createdAt: 1 }) // Sort từ cũ đến mới
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commentModel.countDocuments(query).exec(),
    ]);

    // Xây dựng cây comments (parent-child)
    const commentTree = this.buildCommentTree(comments);

    return {
      data: commentTree,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy comment theo ID
   * @param id - Comment ID
   * @returns Comment document
   */
  async findOne(id: string): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment với ID ${id} không tồn tại`);
    }
    return comment;
  }

  /**
   * Cập nhật comment
   * @param id - Comment ID
   * @param content - Nội dung mới
   * @param userId - ID user thực hiện
   * @returns Comment đã cập nhật
   */
  async update(
    id: string,
    content: string,
    user: { _id: any; roles: string[] },
  ): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment với ID ${id} không tồn tại`);
    }

    // Kiểm tra quyền
    const userId = user._id.toString();
    const isAuthor = comment.user._id.toString() === userId;
    const isAdmin = user.roles?.includes('admin') || user.roles?.includes('editor');

    // Admin và editor có quyền sửa tất cả comments
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền sửa comment này');
    }

    const updated = await this.commentModel
      .findByIdAndUpdate(id, { content }, { new: true })
      .exec();
    
    if (!updated) {
      throw new NotFoundException('Comment không tồn tại');
    }
    
    return updated;
  }

  /**
   * Xóa comment
   * @param id - Comment ID
   * @param userId - ID user thực hiện
   */
  async remove(id: string, user: { _id: any; roles: string[] }): Promise<void> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment với ID ${id} không tồn tại`);
    }

    // Kiểm tra quyền
    const userId = user._id.toString();
    const isAuthor = comment.user._id.toString() === userId;
    const isAdmin = user.roles?.includes('admin') || user.roles?.includes('editor');

    // Admin và editor có quyền xóa tất cả comments
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa comment này');
    }

    // Xóa comment và các comment con
    await this.deleteCommentAndChildren(id);

    // Giảm số lượng comment của target
    if (comment.target_model === 'Article') {
      await this.articlesService.decrementComment(comment.target_id.toString());
    } else if (comment.target_model === 'ForumThread') {
      await this.forumThreadsService.decrementReplyCount(comment.target_id.toString());
    }
  }

  /**
   * Xóa comment và tất cả comment con
   * @param id - Comment ID
   */
  private async deleteCommentAndChildren(id: string): Promise<void> {
    // Tìm tất cả comment con
    const children = await this.commentModel.find({ parent_id: id });
    
    // Xóa đệ quy các comment con
    for (const child of children) {
      await this.deleteCommentAndChildren(child._id.toString());
    }

    // Xóa comment hiện tại
    await this.commentModel.findByIdAndDelete(id);
  }

  /**
   * Xây dựng cây comments từ danh sách phẳng
   * @param comments - Danh sách comments phẳng
   * @returns Danh sách comments dạng cây
   */
  private buildCommentTree(comments: CommentDocument[]): any[] {
    const map = new Map();
    const roots: any[] = [];

    // Tạo map
    comments.forEach((comment) => {
      map.set(comment._id.toString(), { ...comment.toObject(), replies: [] });
    });

    // Xây dựng cây
    comments.forEach((comment) => {
      const node = map.get(comment._id.toString());
      if (comment.parent_id) {
        const parent = map.get(comment.parent_id.toString());
        if (parent) {
          parent.replies.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Duyệt comment (approve)
   * @param id - Comment ID
   */
  async approve(id: string): Promise<void> {
    await this.commentModel.findByIdAndUpdate(id, { is_approved: true });
  }

  /**
   * Từ chối comment (reject)
   * @param id - Comment ID
   */
  async reject(id: string): Promise<void> {
    await this.commentModel.findByIdAndUpdate(id, { is_approved: false });
  }
}

