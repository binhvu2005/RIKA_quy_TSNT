import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ForumThread,
  ForumThreadDocument,
} from './schemas/forum-thread.schema';
import { CreateForumThreadDto } from './dto/create-forum-thread.dto';
import { UsersService } from '../iam/users.service';
import { CategoriesService } from '../cms/categories.service';
import { ProfanityFilterService } from '../common/services/profanity-filter.service';

/**
 * Forum Threads Service
 * Xử lý logic nghiệp vụ liên quan đến Forum Thread
 */
@Injectable()
export class ForumThreadsService {
  constructor(
    @InjectModel(ForumThread.name)
    private forumThreadModel: Model<ForumThreadDocument>,
    private usersService: UsersService,
    private categoriesService: CategoriesService,
    private profanityFilterService: ProfanityFilterService,
  ) {}

  /**
   * Tạo forum thread mới
   * @param createForumThreadDto - Dữ liệu tạo thread
   * @param userId - ID user tạo thread
   * @returns Forum Thread đã tạo
   */
  async create(
    createForumThreadDto: CreateForumThreadDto,
    userId: string,
  ): Promise<ForumThreadDocument> {
    // Kiểm tra category tồn tại
    await this.categoriesService.findOne(createForumThreadDto.category);

    // Lấy thông tin user để tạo author snapshot
    const user = await this.usersService.findOne(userId);

    // Lọc ngôn từ độc hại trong title và content
    const titleFilter = this.profanityFilterService.filter(createForumThreadDto.title);
    const contentFilter = this.profanityFilterService.filter(createForumThreadDto.content);

    // Tạo author snapshot
    const authorSnapshot = {
      _id: user._id,
      name: user.profile?.full_name || user.username,
      avatar: user.profile?.avatar,
    };

    const thread = new this.forumThreadModel({
      ...createForumThreadDto,
      title: titleFilter.filteredText,
      content: contentFilter.filteredText,
      author: authorSnapshot,
      is_approved: !titleFilter.hasProfanity && !contentFilter.hasProfanity, // Tự động reject nếu có ngôn từ độc hại
      stats: {
        replies_count: 0,
        views_count: 0,
      },
    });

    return thread.save();
  }

  /**
   * Lấy danh sách forum threads với phân trang và filter
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @param search - Từ khóa tìm kiếm
   * @param category - Lọc theo category
   * @returns Danh sách threads và metadata phân trang
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Tìm kiếm text
    if (search) {
      query.$text = { $search: search };
    }

    // Lọc theo category
    if (category) {
      query.category = category;
    }

    const [threads, total] = await Promise.all([
      this.forumThreadModel
        .find(query)
        .populate('category', 'name slug')
        .sort({ is_sticky: -1, last_reply_at: -1 }) // Sticky lên đầu, sau đó sort theo last_reply_at
        .skip(skip)
        .limit(limit)
        .exec(),
      this.forumThreadModel.countDocuments(query).exec(),
    ]);

    return {
      data: threads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy forum thread theo ID
   * @param id - Thread ID
   * @param incrementView - Có tăng lượt xem không
   * @returns Forum Thread document
   */
  async findOne(
    id: string,
    incrementView: boolean = false,
  ): Promise<ForumThreadDocument> {
    const thread = await this.forumThreadModel
      .findById(id)
      .populate('category', 'name slug')
      .exec();

    if (!thread) {
      throw new NotFoundException(`Forum Thread với ID ${id} không tồn tại`);
    }

    // Tăng lượt xem nếu cần
    if (incrementView) {
      thread.stats.views_count = (thread.stats.views_count || 0) + 1;
      await thread.save();
    }

    return thread;
  }

  /**
   * Cập nhật forum thread
   * @param id - Thread ID
   * @param updateData - Dữ liệu cập nhật
   * @param userId - ID user thực hiện
   * @returns Forum Thread đã cập nhật
   */
  async update(
    id: string,
    updateData: Partial<CreateForumThreadDto>,
    user: { _id: any; roles: string[] },
  ): Promise<ForumThreadDocument> {
    const thread = await this.forumThreadModel.findById(id);
    if (!thread) {
      throw new NotFoundException(`Forum Thread với ID ${id} không tồn tại`);
    }

    // Kiểm tra quyền
    const userId = user._id.toString();
    const isAuthor = thread.author._id.toString() === userId;
    const isAdmin = user.roles?.includes('admin') || user.roles?.includes('editor');

    // Admin và editor có quyền sửa tất cả threads
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền sửa thread này');
    }

    const updated = await this.forumThreadModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category', 'name slug')
      .exec();
    
    if (!updated) {
      throw new NotFoundException('Forum thread không tồn tại');
    }
    
    return updated;
  }

  /**
   * Xóa forum thread
   * @param id - Thread ID
   * @param userId - ID user thực hiện
   */
  async remove(id: string, user: { _id: any; roles: string[] }): Promise<void> {
    const thread = await this.forumThreadModel.findById(id);
    if (!thread) {
      throw new NotFoundException(`Forum Thread với ID ${id} không tồn tại`);
    }

    // Kiểm tra quyền
    const userId = user._id.toString();
    const isAuthor = thread.author._id.toString() === userId;
    const isAdmin = user.roles?.includes('admin') || user.roles?.includes('editor');

    // Admin và editor có quyền xóa tất cả threads
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa thread này');
    }

    await this.forumThreadModel.findByIdAndDelete(id);
  }

  /**
   * Cập nhật thời gian reply cuối
   * @param id - Thread ID
   */
  async updateLastReplyAt(id: string): Promise<void> {
    await this.forumThreadModel.findByIdAndUpdate(id, {
      last_reply_at: new Date(),
      $inc: { 'stats.replies_count': 1 },
    });
  }

  /**
   * Giảm số lượng reply
   * @param id - Thread ID
   */
  async decrementReplyCount(id: string): Promise<void> {
    await this.forumThreadModel.findByIdAndUpdate(id, {
      $inc: { 'stats.replies_count': -1 },
    });
  }
}

