import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { EmailService } from '../common/modules/email.service';

/**
 * OTP Service
 * Xử lý logic tạo và xác thực OTP
 */
@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private emailService: EmailService,
  ) {}

  /**
   * Tạo mã OTP ngẫu nhiên 6 chữ số
   * @returns Mã OTP
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Tạo và gửi OTP qua email
   * @param email - Email người dùng
   * @param userName - Tên người dùng (optional)
   * @returns Mã OTP đã tạo (chỉ để test, không nên trả về trong production)
   */
  async createAndSendOtp(email: string, userName?: string): Promise<string> {
    // Đánh dấu tất cả OTP cũ của email này là đã sử dụng
    await this.otpModel.updateMany(
      { email, used: false },
      { $set: { used: true } },
    );

    // Tạo mã OTP mới
    const otpCode = this.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP hết hạn sau 10 phút

    // Lưu OTP vào database
    const otp = new this.otpModel({
      email,
      code: otpCode,
      expires_at: expiresAt,
      used: false,
    });
    await otp.save();

    // Gửi OTP qua email
    try {
      await this.emailService.sendOtpEmail(email, otpCode, userName);
    } catch (error) {
      // Nếu gửi email lỗi, vẫn lưu OTP nhưng log lỗi
      console.error('Lỗi gửi email OTP:', error);
      // Có thể throw error nếu muốn
    }

    return otpCode; // Chỉ để test, trong production không nên trả về
  }

  /**
   * Xác thực OTP
   * @param email - Email người dùng
   * @param otpCode - Mã OTP cần xác thực
   * @returns true nếu OTP hợp lệ
   */
  async verifyOtp(email: string, otpCode: string): Promise<boolean> {
    const otp = await this.otpModel.findOne({
      email,
      code: otpCode,
      used: false,
      expires_at: { $gt: new Date() }, // OTP chưa hết hạn
    });

    if (!otp) {
      return false;
    }

    // Đánh dấu OTP đã sử dụng
    otp.used = true;
    await otp.save();

    return true;
  }

  /**
   * Kiểm tra OTP có hợp lệ không (không đánh dấu đã sử dụng)
   * @param email - Email người dùng
   * @param otpCode - Mã OTP cần kiểm tra
   * @returns true nếu OTP hợp lệ
   */
  async checkOtp(email: string, otpCode: string): Promise<boolean> {
    const otp = await this.otpModel.findOne({
      email,
      code: otpCode,
      used: false,
      expires_at: { $gt: new Date() }, // OTP chưa hết hạn
    });

    return !!otp;
  }
}

