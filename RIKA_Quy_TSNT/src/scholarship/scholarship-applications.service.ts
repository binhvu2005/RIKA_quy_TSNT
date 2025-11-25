import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ScholarshipApplication,
  ScholarshipApplicationDocument,
} from './schemas/scholarship-application.schema';
import { CreateScholarshipApplicationDto } from './dto/create-scholarship-application.dto';
import { ScholarshipsService } from './scholarships.service';

/**
 * Scholarship Applications Service
 * Xử lý logic nghiệp vụ liên quan đến Scholarship Application
 */
@Injectable()
export class ScholarshipApplicationsService {
  constructor(
    @InjectModel(ScholarshipApplication.name)
    private applicationModel: Model<ScholarshipApplicationDocument>,
    private scholarshipsService: ScholarshipsService,
  ) {}

  /**
   * Tạo application mới
   * @param createApplicationDto - Dữ liệu tạo application
   * @param userId - ID user nộp đơn
   * @returns Application đã tạo
   */
  async create(
    createApplicationDto: CreateScholarshipApplicationDto,
    userId: string,
  ): Promise<ScholarshipApplicationDocument> {
    // Kiểm tra scholarship tồn tại và đang mở
    const scholarship = await this.scholarshipsService.findOne(
      createApplicationDto.scholarship_id,
    );

    if (scholarship.status !== 'open') {
      throw new BadRequestException('Đợt học bổng này không đang mở nhận hồ sơ');
    }

    // Kiểm tra đã nộp đơn chưa
    const existing = await this.applicationModel.findOne({
      scholarship_id: createApplicationDto.scholarship_id,
      user_id: userId,
    });

    if (existing) {
      throw new ConflictException('Bạn đã nộp đơn cho đợt học bổng này rồi');
    }

    // Chuyển đổi data sang Map
    const dataMap = createApplicationDto.data
      ? new Map(Object.entries(createApplicationDto.data))
      : new Map();

    const application = new this.applicationModel({
      ...createApplicationDto,
      user_id: userId,
      data: dataMap,
      status: 'submitted',
    });

    return application.save();
  }

  /**
   * Lấy danh sách applications với phân trang và filter
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @param scholarshipId - Lọc theo scholarship
   * @param userId - Lọc theo user
   * @param status - Lọc theo trạng thái
   * @returns Danh sách applications và metadata phân trang
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    scholarshipId?: string,
    userId?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (scholarshipId) {
      query.scholarship_id = scholarshipId;
    }

    if (userId) {
      query.user_id = userId;
    }

    if (status) {
      query.status = status;
    }

    const [applications, total] = await Promise.all([
      this.applicationModel
        .find(query)
        .populate('scholarship_id', 'name budget criteria')
        .populate('user_id', 'username profile')
        .populate('review.reviewer_id', 'username profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.applicationModel.countDocuments(query).exec(),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy application theo ID
   * @param id - Application ID
   * @returns Application document
   */
  async findOne(id: string): Promise<ScholarshipApplicationDocument> {
    const application = await this.applicationModel
      .findById(id)
      .populate('scholarship_id', 'name budget criteria')
      .populate('user_id', 'username profile')
      .populate('review.reviewer_id', 'username profile')
      .exec();

    if (!application) {
      throw new NotFoundException(
        `Application với ID ${id} không tồn tại`,
      );
    }

    return application;
  }

  /**
   * Cập nhật application
   * @param id - Application ID
   * @param updateData - Dữ liệu cập nhật
   * @param userId - ID user thực hiện
   * @returns Application đã cập nhật
   */
  async update(
    id: string,
    updateData: Partial<CreateScholarshipApplicationDto>,
    userId: string,
  ): Promise<ScholarshipApplicationDocument> {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException(
        `Application với ID ${id} không tồn tại`,
      );
    }

    // Chỉ user nộp đơn mới được sửa (và chỉ khi status là submitted)
    if (application.user_id.toString() !== userId) {
      throw new BadRequestException('Bạn không có quyền sửa đơn này');
    }

    if (application.status !== 'submitted') {
      throw new BadRequestException('Không thể sửa đơn đã được xử lý');
    }

    // Xử lý data nếu có
    if (updateData.data) {
      updateData['data'] = new Map(Object.entries(updateData.data)) as any;
    }

    const updated = await this.applicationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('scholarship_id', 'name budget criteria')
      .populate('user_id', 'username profile')
      .exec();
    
    if (!updated) {
      throw new NotFoundException('Scholarship application không tồn tại');
    }
    
    return updated;
  }

  /**
   * Chấm điểm application
   * @param id - Application ID
   * @param reviewData - Dữ liệu chấm điểm
   * @param reviewerId - ID người chấm
   * @returns Application đã được chấm
   */
  async review(
    id: string,
    reviewData: {
      criteria_scores?: Record<string, number>;
      note?: string;
    },
    reviewerId: string,
  ): Promise<ScholarshipApplicationDocument> {
    const application = await this.applicationModel
      .findById(id)
      .populate('scholarship_id')
      .exec();

    if (!application) {
      throw new NotFoundException(
        `Application với ID ${id} không tồn tại`,
      );
    }

    const scholarship = application.scholarship_id as any;

    // Tính điểm tổng từ criteria_scores
    let totalScore = 0;
    if (reviewData.criteria_scores && scholarship.criteria) {
      for (const criteria of scholarship.criteria) {
        const score = reviewData.criteria_scores[criteria.key] || 0;
        totalScore += (score * criteria.weight) / 100;
      }
    }

    // Cập nhật review
    application.review = {
      score: totalScore,
      criteria_scores: reviewData.criteria_scores
        ? new Map(Object.entries(reviewData.criteria_scores))
        : undefined,
      note: reviewData.note,
      reviewer_id: reviewerId as any,
      reviewed_at: new Date(),
    };

    application.status = 'under_review';

    return application.save();
  }

  /**
   * Cập nhật trạng thái application
   * @param id - Application ID
   * @param status - Trạng thái mới
   * @returns Application đã cập nhật
   */
  async updateStatus(
    id: string,
    status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'awarded',
  ): Promise<ScholarshipApplicationDocument> {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException(
        `Application với ID ${id} không tồn tại`,
      );
    }

    application.status = status;
    return application.save();
  }

  /**
   * Xóa application
   * @param id - Application ID
   * @param userId - ID user thực hiện
   */
  async remove(id: string, userId: string): Promise<void> {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException(
        `Application với ID ${id} không tồn tại`,
      );
    }

    // Chỉ user nộp đơn mới được xóa (và chỉ khi status là submitted)
    if (application.user_id.toString() !== userId) {
      throw new BadRequestException('Bạn không có quyền xóa đơn này');
    }

    if (application.status !== 'submitted') {
      throw new BadRequestException('Không thể xóa đơn đã được xử lý');
    }

    await this.applicationModel.findByIdAndDelete(id);
  }
}

