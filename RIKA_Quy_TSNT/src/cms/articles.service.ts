import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CategoriesService } from './categories.service';
import { UsersService } from '../iam/users.service';

/**
 * Articles Service
 * Xử lý logic nghiệp vụ liên quan đến Article
 */
@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
  ) {}

  /**
   * Tạo article mới
   * @param createArticleDto - Dữ liệu tạo article
   * @param userId - ID user tạo article
   * @returns Article đã tạo
   */
  async create(
    createArticleDto: CreateArticleDto,
    userId: string,
  ): Promise<ArticleDocument> {
    // Kiểm tra category tồn tại
    const category = await this.categoriesService.findOne(
      createArticleDto.category,
    );

    // Lấy thông tin user để tạo author snapshot
    const user = await this.usersService.findOne(userId);

    // Tạo slug nếu không có
    let slug = createArticleDto.slug;
    if (!slug) {
      slug = this.generateSlug(createArticleDto.title);
    }

    // Kiểm tra slug đã tồn tại
    const existingArticle = await this.articleModel.findOne({ slug });
    if (existingArticle) {
      throw new ConflictException('Slug đã tồn tại');
    }

    // Tạo author snapshot
    const authorSnapshot = {
      _id: user._id,
      name: user.profile?.full_name || user.username,
      avatar: user.profile?.avatar,
    };

    const article = new this.articleModel({
      ...createArticleDto,
      slug,
      author: authorSnapshot,
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
      },
    });

    return article.save();
  }

  /**
   * Lấy danh sách articles với phân trang và filter
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @param search - Từ khóa tìm kiếm
   * @param category - Lọc theo category
   * @param status - Lọc theo trạng thái
   * @param tags - Lọc theo tags
   * @param author - Lọc theo tác giả (author._id)
   * @param startDate - Ngày bắt đầu
   * @param endDate - Ngày kết thúc
   * @param sortBy - Sắp xếp theo field
   * @param sortOrder - Thứ tự sắp xếp (asc/desc)
   * @returns Danh sách articles và metadata phân trang
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    status?: string,
    tags?: string[],
    author?: string,
    startDate?: Date,
    endDate?: Date,
    sortBy?: string,
    sortOrder?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Tìm kiếm text (title, content)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Lọc theo category
    if (category) {
      query.category = category;
    }

    // Lọc theo status (mặc định chỉ lấy published nếu không có quyền admin)
    if (status) {
      query.status = status;
    } else {
      query.status = 'published'; // Mặc định chỉ lấy bài đã publish
    }

    // Lọc theo tags
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Lọc theo tác giả
    if (author) {
      query['author._id'] = author;
    }

    // Lọc theo ngày tháng
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    // Build sort object
    const sortObj: any = {};
    if (sortBy) {
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj.createdAt = -1; // Default sort by createdAt desc
    }

    const [articles, total] = await Promise.all([
      this.articleModel
        .find(query)
        .populate('category', 'name slug')
        .skip(skip)
        .limit(limit)
        .sort(sortObj)
        .exec(),
      this.articleModel.countDocuments(query).exec(),
    ]);

    return {
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy article theo ID
   * @param id - Article ID
   * @param incrementView - Có tăng lượt xem không
   * @returns Article document
   */
  async findOne(id: string, incrementView: boolean = false): Promise<ArticleDocument> {
    const article = await this.articleModel
      .findById(id)
      .populate('category', 'name slug')
      .exec();

    if (!article) {
      throw new NotFoundException(`Article với ID ${id} không tồn tại`);
    }

    // Tăng lượt xem nếu cần
    if (incrementView) {
      article.stats.views = (article.stats.views || 0) + 1;
      await article.save();
    }

    return article;
  }

  /**
   * Lấy article theo slug
   * @param slug - Article slug
   * @param incrementView - Có tăng lượt xem không
   * @returns Article document
   */
  async findBySlug(
    slug: string,
    incrementView: boolean = false,
  ): Promise<ArticleDocument> {
    const article = await this.articleModel
      .findOne({ slug })
      .populate('category', 'name slug')
      .exec();

    if (!article) {
      throw new NotFoundException(`Article với slug ${slug} không tồn tại`);
    }

    // Tăng lượt xem nếu cần
    if (incrementView) {
      article.stats.views = (article.stats.views || 0) + 1;
      await article.save();
    }

    return article;
  }

  /**
   * Lấy danh sách bài viết liên quan
   * @param articleId - ID bài viết hiện tại
   * @param limit - Số lượng bài viết liên quan (mặc định 5)
   * @returns Danh sách bài viết liên quan
   */
  async getRelatedArticles(
    articleId: string,
    limit: number = 5,
  ): Promise<ArticleDocument[]> {
    const article = await this.articleModel.findById(articleId);
    if (!article) {
      throw new NotFoundException(`Article với ID ${articleId} không tồn tại`);
    }

    const query: any = {
      _id: { $ne: articleId },
      status: 'published',
      $or: [],
    };

    // Tìm theo category
    if (article.category) {
      query.$or.push({ category: article.category });
    }

    // Tìm theo tags (ít nhất 1 tag trùng)
    if (article.tags && article.tags.length > 0) {
      query.$or.push({ tags: { $in: article.tags } });
    }

    // Nếu không có category hoặc tags thì lấy bài viết mới nhất
    if (query.$or.length === 0) {
      delete query.$or;
      delete query.$ne;
    }

    const relatedArticles = await this.articleModel
      .find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return relatedArticles;
  }

  /**
   * Cập nhật article
   * @param id - Article ID
   * @param updateArticleDto - Dữ liệu cập nhật
   * @param user - User object chứa _id và roles
   * @returns Article đã cập nhật
   */
  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    user: { _id: any; roles: string[] },
  ): Promise<ArticleDocument> {
    const article = await this.articleModel.findById(id);
    if (!article) {
      throw new NotFoundException(`Article với ID ${id} không tồn tại`);
    }

    // Kiểm tra quyền
    const userId = user._id.toString();
    const isAuthor = article.author._id.toString() === userId;
    const isAdmin = user.roles?.includes('admin') || user.roles?.includes('editor');

    // Admin và editor có quyền sửa tất cả bài viết
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền sửa bài viết này');
    }

    // Xử lý slug nếu có thay đổi title
    if (updateArticleDto.title && !updateArticleDto.slug) {
      updateArticleDto.slug = this.generateSlug(updateArticleDto.title);
    }

    // Kiểm tra slug trùng lặp
    if (updateArticleDto.slug) {
      const existing = await this.articleModel.findOne({
        slug: updateArticleDto.slug,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException('Slug đã tồn tại');
      }
    }

    // Kiểm tra category nếu có thay đổi
    if (updateArticleDto.category) {
      await this.categoriesService.findOne(updateArticleDto.category);
    }

    const updated = await this.articleModel
      .findByIdAndUpdate(id, updateArticleDto, { new: true })
      .populate('category', 'name slug')
      .exec();
    
    if (!updated) {
      throw new NotFoundException('Article không tồn tại');
    }
    
    return updated;
  }

  /**
   * Xóa article
   * @param id - Article ID
   * @param user - User object chứa _id và roles
   */
  async remove(id: string, user: { _id: any; roles: string[] }): Promise<void> {
    const article = await this.articleModel.findById(id);
    if (!article) {
      throw new NotFoundException(`Article với ID ${id} không tồn tại`);
    }

    // Kiểm tra quyền
    const userId = user._id.toString();
    const isAuthor = article.author._id.toString() === userId;
    const isAdmin = user.roles?.includes('admin') || user.roles?.includes('editor');

    // Admin và editor có quyền xóa tất cả bài viết
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }

    await this.articleModel.findByIdAndDelete(id);
  }

  /**
   * Tăng lượt like
   * @param id - Article ID
   */
  async incrementLike(id: string): Promise<void> {
    await this.articleModel.findByIdAndUpdate(id, {
      $inc: { 'stats.likes': 1 },
    });
  }

  /**
   * Giảm lượt like
   * @param id - Article ID
   */
  async decrementLike(id: string): Promise<void> {
    await this.articleModel.findByIdAndUpdate(id, {
      $inc: { 'stats.likes': -1 },
    });
  }

  /**
   * Tăng lượt comment
   * @param id - Article ID
   */
  async incrementComment(id: string): Promise<void> {
    await this.articleModel.findByIdAndUpdate(id, {
      $inc: { 'stats.comments': 1 },
    });
  }

  /**
   * Giảm lượt comment
   * @param id - Article ID
   */
  async decrementComment(id: string): Promise<void> {
    await this.articleModel.findByIdAndUpdate(id, {
      $inc: { 'stats.comments': -1 },
    });
  }

  /**
   * Tạo slug từ title
   * @param title - Tiêu đề
   * @returns Slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/[^a-z0-9]+/g, '-') // Thay ký tự đặc biệt bằng dấu gạch ngang
      .replace(/^-+|-+$/g, '') // Loại bỏ dấu gạch ngang ở đầu và cuối
      .substring(0, 100); // Giới hạn độ dài
  }
}

