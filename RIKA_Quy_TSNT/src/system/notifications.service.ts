import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

/**
 * Notifications Service
 * Xử lý logic nghiệp vụ liên quan đến Notification
 */
@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * Tạo notification mới
   * @param createNotificationDto - Dữ liệu tạo notification
   * @returns Notification đã tạo
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      user_id: new Types.ObjectId(createNotificationDto.user_id),
    });
    return notification.save();
  }

  /**
   * Tạo nhiều notifications cùng lúc
   * @param notifications - Mảng các notification DTO
   * @returns Danh sách notifications đã tạo
   */
  async createMany(notifications: CreateNotificationDto[]): Promise<NotificationDocument[]> {
    // Convert user_id string to ObjectId
    const notificationsWithObjectId = notifications.map(notif => ({
      ...notif,
      user_id: new Types.ObjectId(notif.user_id),
    }));
    const created = await this.notificationModel.insertMany(notificationsWithObjectId);
    return created as NotificationDocument[];
  }

  /**
   * Lấy danh sách notifications của user
   * @param userId - ID user
   * @param isRead - Lọc theo trạng thái đọc (optional)
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @returns Danh sách notifications với phân trang
   */
  async findByUser(
    userId: string,
    isRead?: boolean,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const query: any = { user_id: userId };
    if (isRead !== undefined) {
      query.is_read = isRead;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(query).exec(),
      this.notificationModel.countDocuments({ user_id: userId, is_read: false }).exec(),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * Đánh dấu notification là đã đọc
   * @param notificationId - ID notification
   * @param userId - ID user (để đảm bảo user chỉ đọc notification của mình)
   * @returns Notification đã cập nhật
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, user_id: userId },
      { is_read: true },
      { new: true },
    );

    if (!notification) {
      throw new Error('Notification không tồn tại hoặc không thuộc về user này');
    }

    return notification;
  }

  /**
   * Đánh dấu tất cả notifications của user là đã đọc
   * @param userId - ID user
   * @returns Số lượng notifications đã cập nhật
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
    return result.modifiedCount;
  }

  /**
   * Xóa notification
   * @param notificationId - ID notification
   * @param userId - ID user
   */
  async remove(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel.findOneAndDelete({
      _id: notificationId,
      user_id: userId,
    });
  }

  /**
   * Xóa tất cả notifications đã đọc của user
   * @param userId - ID user
   * @returns Số lượng notifications đã xóa
   */
  async removeAllRead(userId: string): Promise<number> {
    const result = await this.notificationModel.deleteMany({
      user_id: userId,
      is_read: true,
    });
    return result.deletedCount;
  }
}

