import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

/**
 * Audit Logs Service
 * Xử lý logic nghiệp vụ liên quan đến Audit Log
 */
@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Tạo audit log
   * @param logData - Dữ liệu log
   * @returns Audit Log document
   */
  async create(logData: {
    actor: string;
    action: string;
    collection: string;
    target_id?: string;
    changes?: any;
    ip_address?: string;
    user_agent?: string;
  }): Promise<AuditLogDocument> {
    const log = new this.auditLogModel(logData);
    return log.save();
  }

  /**
   * Lấy danh sách audit logs với phân trang và filter
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @param actorId - Lọc theo người thực hiện
   * @param action - Lọc theo hành động
   * @param collection - Lọc theo collection
   * @param startDate - Ngày bắt đầu
   * @param endDate - Ngày kết thúc
   * @returns Danh sách audit logs và metadata phân trang
   */
  async findAll(
    page: number = 1,
    limit: number = 50,
    actorId?: string,
    action?: string,
    collection?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (actorId) {
      query.actor = actorId;
    }

    if (action) {
      query.action = action;
    }

    if (collection) {
      query.collection = collection;
    }

    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) {
        query.created_at.$gte = startDate;
      }
      if (endDate) {
        query.created_at.$lte = endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .populate('actor', 'username profile')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditLogModel.countDocuments(query).exec(),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy audit logs của một đối tượng cụ thể
   * @param collection - Tên collection
   * @param targetId - ID đối tượng
   * @returns Danh sách audit logs
   */
  async findByTarget(
    collection: string,
    targetId: string,
  ): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ collection, target_id: targetId })
      .populate('actor', 'username profile')
      .sort({ created_at: -1 })
      .exec();
  }
}

