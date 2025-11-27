import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bookmark, BookmarkDocument } from './schemas/bookmark.schema';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { ArticlesService } from './articles.service';
import { ForumThreadsService } from '../forum/forum-threads.service';

/**
 * Bookmarks Service
 * Xử lý logic nghiệp vụ liên quan đến Bookmark
 */
@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(Bookmark.name) private bookmarkModel: Model<BookmarkDocument>,
    private articlesService: ArticlesService,
    @Inject(forwardRef(() => ForumThreadsService))
    private forumThreadsService: ForumThreadsService,
  ) {}

  /**
   * Tạo bookmark mới
   * @param createBookmarkDto - Dữ liệu tạo bookmark
   * @param userId - ID user tạo bookmark
   * @returns Bookmark đã tạo
   */
  async create(
    createBookmarkDto: CreateBookmarkDto,
    userId: string,
  ): Promise<BookmarkDocument> {
    // Kiểm tra đối tượng target tồn tại
    await this.validateTarget(
      createBookmarkDto.target_model,
      createBookmarkDto.target_id,
    );

    // Kiểm tra bookmark đã tồn tại chưa
    const existing = await this.bookmarkModel.findOne({
      user_id: userId,
      target_model: createBookmarkDto.target_model,
      target_id: createBookmarkDto.target_id,
    });

    if (existing) {
      throw new ConflictException('Đã bookmark bài viết này rồi');
    }

    const bookmark = new this.bookmarkModel({
      ...createBookmarkDto,
      user_id: userId,
    });

    return bookmark.save();
  }

  /**
   * Xóa bookmark
   * @param targetModel - Loại đối tượng
   * @param targetId - ID đối tượng
   * @param userId - ID user
   */
  async remove(
    targetModel: string,
    targetId: string,
    userId: string,
  ): Promise<void> {
    const bookmark = await this.bookmarkModel.findOneAndDelete({
      user_id: userId,
      target_model: targetModel,
      target_id: targetId,
    });

    if (!bookmark) {
      throw new NotFoundException('Không tìm thấy bookmark');
    }
  }

  /**
   * Kiểm tra user đã bookmark chưa
   * @param targetModel - Loại đối tượng
   * @param targetId - ID đối tượng
   * @param userId - ID user
   * @returns true nếu đã bookmark
   */
  async isBookmarked(
    targetModel: string,
    targetId: string,
    userId: string,
  ): Promise<boolean> {
    const bookmark = await this.bookmarkModel.findOne({
      user_id: userId,
      target_model: targetModel,
      target_id: targetId,
    });
    return !!bookmark;
  }

  /**
   * Lấy danh sách bookmarks của user
   * @param userId - ID user
   * @param targetModel - Lọc theo loại (optional)
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @returns Danh sách bookmarks với phân trang
   */
  async findByUser(
    userId: string,
    targetModel?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const query: any = { user_id: userId };
    if (targetModel) {
      query.target_model = targetModel;
    }

    const [bookmarks, total] = await Promise.all([
      this.bookmarkModel
        .find(query)
        .populate('target_id')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookmarkModel.countDocuments(query).exec(),
    ]);

    return {
      data: bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Validate target tồn tại
   * @param targetModel - Loại đối tượng
   * @param targetId - ID đối tượng
   */
  private async validateTarget(targetModel: string, targetId: string): Promise<void> {
    if (targetModel === 'Article') {
      await this.articlesService.findOne(targetId);
    } else if (targetModel === 'ForumThread') {
      await this.forumThreadsService.findOne(targetId);
    } else {
      throw new BadRequestException('Loại đối tượng không hợp lệ');
    }
  }
}

