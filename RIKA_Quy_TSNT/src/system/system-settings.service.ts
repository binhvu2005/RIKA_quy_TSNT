import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SystemSetting,
  SystemSettingDocument,
} from './schemas/system-setting.schema';

/**
 * System Settings Service
 * Xử lý logic nghiệp vụ liên quan đến System Setting
 */
@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectModel(SystemSetting.name)
    private settingModel: Model<SystemSettingDocument>,
  ) {}

  /**
   * Tạo hoặc cập nhật setting
   * @param key - Key của setting
   * @param value - Giá trị
   * @param group - Nhóm cấu hình
   * @param description - Mô tả
   * @returns Setting document
   */
  async set(
    key: string,
    value: any,
    group: string = 'general',
    description?: string,
  ): Promise<SystemSettingDocument> {
    return this.settingModel.findOneAndUpdate(
      { key },
      { key, value, group, description },
      { upsert: true, new: true },
    );
  }

  /**
   * Lấy setting theo key
   * @param key - Key của setting
   * @returns Setting document hoặc null
   */
  async get(key: string): Promise<SystemSettingDocument | null> {
    return this.settingModel.findOne({ key }).exec();
  }

  /**
   * Lấy giá trị setting (chỉ trả về value)
   * @param key - Key của setting
   * @param defaultValue - Giá trị mặc định nếu không tìm thấy
   * @returns Giá trị setting
   */
  async getValue(key: string, defaultValue?: any): Promise<any> {
    const setting = await this.get(key);
    return setting ? setting.value : defaultValue;
  }

  /**
   * Lấy tất cả settings theo group
   * @param group - Nhóm cấu hình
   * @returns Danh sách settings
   */
  async getByGroup(group: string): Promise<SystemSettingDocument[]> {
    return this.settingModel.find({ group }).exec();
  }

  /**
   * Lấy tất cả settings
   * @returns Danh sách settings
   */
  async getAll(): Promise<SystemSettingDocument[]> {
    return this.settingModel.find().sort({ group: 1, key: 1 }).exec();
  }

  /**
   * Xóa setting
   * @param key - Key của setting
   */
  async remove(key: string): Promise<void> {
    const result = await this.settingModel.findOneAndDelete({ key });
    if (!result) {
      throw new NotFoundException(`Setting với key ${key} không tồn tại`);
    }
  }
}

