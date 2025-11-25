import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaFile, MediaFileDocument } from './schemas/media-file.schema';

/**
 * Media Files Service
 * Xử lý logic nghiệp vụ liên quan đến Media File
 */
@Injectable()
export class MediaFilesService {
  constructor(
    @InjectModel(MediaFile.name)
    private mediaFileModel: Model<MediaFileDocument>,
  ) {}

  /**
   * Tạo media file record
   * @param fileData - Dữ liệu file
   * @param uploaderId - ID người upload
   * @returns Media File document
   */
  async create(
    fileData: {
      url: string;
      original_name: string;
      type: string;
      size?: number;
      description?: string;
    },
    uploaderId: string,
  ): Promise<MediaFileDocument> {
    const mediaFile = new this.mediaFileModel({
      ...fileData,
      uploader: uploaderId,
    });

    return mediaFile.save();
  }

  /**
   * Lấy danh sách media files với phân trang
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @param uploaderId - Lọc theo người upload
   * @param type - Lọc theo loại file
   * @returns Danh sách media files và metadata phân trang
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    uploaderId?: string,
    type?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (uploaderId) {
      query.uploader = uploaderId;
    }

    if (type) {
      query.type = type;
    }

    const [files, total] = await Promise.all([
      this.mediaFileModel
        .find(query)
        .populate('uploader', 'username profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.mediaFileModel.countDocuments(query).exec(),
    ]);

    return {
      data: files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy media file theo ID
   * @param id - Media File ID
   * @returns Media File document
   */
  async findOne(id: string): Promise<MediaFileDocument> {
    const file = await this.mediaFileModel
      .findById(id)
      .populate('uploader', 'username profile')
      .exec();

    if (!file) {
      throw new NotFoundException(`Media File với ID ${id} không tồn tại`);
    }

    return file;
  }

  /**
   * Xóa media file
   * @param id - Media File ID
   */
  async remove(id: string): Promise<void> {
    const file = await this.mediaFileModel.findById(id);
    if (!file) {
      throw new NotFoundException(`Media File với ID ${id} không tồn tại`);
    }

    // TODO: Xóa file vật lý từ storage

    await this.mediaFileModel.findByIdAndDelete(id);
  }
}

