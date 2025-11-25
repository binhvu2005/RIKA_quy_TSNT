import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  Scholarship,
  ScholarshipDocument,
} from './schemas/scholarship.schema';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';

/**
 * Scholarships Service
 * Xử lý logic nghiệp vụ liên quan đến Scholarship
 */
@Injectable()
export class ScholarshipsService {
  constructor(
    @InjectModel(Scholarship.name)
    private scholarshipModel: Model<ScholarshipDocument>,
  ) {}

  /**
   * Tạo scholarship mới
   * @param createScholarshipDto - Dữ liệu tạo scholarship
   * @returns Scholarship đã tạo
   */
  async create(
    createScholarshipDto: CreateScholarshipDto,
  ): Promise<ScholarshipDocument> {
    // Chuyển đổi budget sang Decimal128
    const budget = mongoose.Types.Decimal128.fromString(
      createScholarshipDto.budget.toString(),
    );

    // Validate tổng trọng số criteria = 100%
    if (createScholarshipDto.criteria && createScholarshipDto.criteria.length > 0) {
      const totalWeight = createScholarshipDto.criteria.reduce(
        (sum, c) => sum + c.weight,
        0,
      );
      if (Math.abs(totalWeight - 100) > 0.01) {
        throw new BadRequestException(
          'Tổng trọng số các tiêu chí phải bằng 100%',
        );
      }
    }

    const scholarship = new this.scholarshipModel({
      ...createScholarshipDto,
      budget,
    });

    return scholarship.save();
  }

  /**
   * Lấy danh sách scholarships với phân trang và filter
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @param search - Từ khóa tìm kiếm
   * @param status - Lọc theo trạng thái
   * @returns Danh sách scholarships và metadata phân trang
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Tìm kiếm text
    if (search) {
      query.$text = { $search: search };
    }

    // Lọc theo status
    if (status) {
      query.status = status;
    }

    const [scholarships, total] = await Promise.all([
      this.scholarshipModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.scholarshipModel.countDocuments(query).exec(),
    ]);

    return {
      data: scholarships,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy scholarship theo ID
   * @param id - Scholarship ID
   * @returns Scholarship document
   */
  async findOne(id: string): Promise<ScholarshipDocument> {
    const scholarship = await this.scholarshipModel.findById(id);
    if (!scholarship) {
      throw new NotFoundException(
        `Scholarship với ID ${id} không tồn tại`,
      );
    }
    return scholarship;
  }

  /**
   * Cập nhật scholarship
   * @param id - Scholarship ID
   * @param updateData - Dữ liệu cập nhật
   * @returns Scholarship đã cập nhật
   */
  async update(
    id: string,
    updateData: Partial<CreateScholarshipDto>,
  ): Promise<ScholarshipDocument> {
    const scholarship = await this.scholarshipModel.findById(id);
    if (!scholarship) {
      throw new NotFoundException(
        `Scholarship với ID ${id} không tồn tại`,
      );
    }

    // Xử lý budget nếu có
    if (updateData.budget !== undefined) {
      updateData['budget'] = mongoose.Types.Decimal128.fromString(
        updateData.budget.toString(),
      ) as any;
    }

    // Validate criteria nếu có
    if (updateData.criteria && updateData.criteria.length > 0) {
      const totalWeight = updateData.criteria.reduce(
        (sum, c) => sum + c.weight,
        0,
      );
      if (Math.abs(totalWeight - 100) > 0.01) {
        throw new BadRequestException(
          'Tổng trọng số các tiêu chí phải bằng 100%',
        );
      }
    }

    const updated = await this.scholarshipModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updated) {
      throw new NotFoundException('Scholarship không tồn tại');
    }
    
    return updated;
  }

  /**
   * Xóa scholarship
   * @param id - Scholarship ID
   */
  async remove(id: string): Promise<void> {
    const scholarship = await this.scholarshipModel.findById(id);
    if (!scholarship) {
      throw new NotFoundException(
        `Scholarship với ID ${id} không tồn tại`,
      );
    }

    // TODO: Kiểm tra có application nào liên quan không
    // Nếu có thì không cho xóa hoặc xóa cả application

    await this.scholarshipModel.findByIdAndDelete(id);
  }
}

