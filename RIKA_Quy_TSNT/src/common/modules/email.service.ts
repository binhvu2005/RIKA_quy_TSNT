import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

/**
 * Email Service
 * Service xử lý gửi email
 */
@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Gửi email OTP để đặt lại mật khẩu
   * @param email - Email người nhận
   * @param otp - Mã OTP
   * @param userName - Tên người dùng
   */
  async sendOtpEmail(
    email: string,
    otp: string,
    userName?: string,
  ): Promise<void> {
    const subject = 'Mã OTP đặt lại mật khẩu - Quỹ Thắp Sáng Niềm Tin';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Quỹ Thắp Sáng Niềm Tin</h1>
          </div>
          <div class="content">
            <p>Xin chào ${userName || 'bạn'},</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng sử dụng mã OTP sau đây:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <div class="warning">
              <strong>Lưu ý:</strong> Mã OTP này chỉ có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.
            </div>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,<br>Đội ngũ Quỹ Thắp Sáng Niềm Tin</p>
          </div>
          <div class="footer">
            <p>Email này được gửi tự động. Vui lòng không trả lời email này.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Gửi email thông báo khi admin thay đổi role
   * @param email - Email người nhận
   * @param userName - Tên người dùng
   * @param oldRole - Role cũ
   * @param newRole - Role mới
   */
  async sendRoleChangeNotification(
    email: string,
    userName: string,
    oldRole: string[],
    newRole: string[],
  ): Promise<void> {
    const subject = 'Thông báo thay đổi quyền - Quỹ Thắp Sáng Niềm Tin';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Quỹ Thắp Sáng Niềm Tin</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${userName}</strong>,</p>
            <p>Quyền của tài khoản của bạn đã được thay đổi bởi quản trị viên.</p>
            <div class="info-box">
              <p><strong>Quyền cũ:</strong> ${oldRole.join(', ')}</p>
              <p><strong>Quyền mới:</strong> ${newRole.join(', ')}</p>
            </div>
            <p>Nếu bạn không yêu cầu thay đổi này hoặc có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
            <p>Trân trọng,<br>Đội ngũ Quỹ Thắp Sáng Niềm Tin</p>
          </div>
          <div class="footer">
            <p>Email này được gửi tự động. Vui lòng không trả lời email này.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Gửi email thông báo khi admin thay đổi status
   * @param email - Email người nhận
   * @param userName - Tên người dùng
   * @param oldStatus - Status cũ
   * @param newStatus - Status mới
   */
  async sendStatusChangeNotification(
    email: string,
    userName: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    const statusLabels: Record<string, string> = {
      active: 'Hoạt động',
      banned: 'Bị cấm',
      pending: 'Đang chờ phê duyệt',
    };

    const subject = 'Thông báo thay đổi trạng thái tài khoản - Quỹ Thắp Sáng Niềm Tin';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
          ${newStatus === 'banned' ? '.warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; color: #721c24; }' : ''}
          ${newStatus === 'active' ? '.success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; color: #155724; }' : ''}
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Quỹ Thắp Sáng Niềm Tin</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${userName}</strong>,</p>
            <p>Trạng thái tài khoản của bạn đã được thay đổi bởi quản trị viên.</p>
            <div class="info-box">
              <p><strong>Trạng thái cũ:</strong> ${statusLabels[oldStatus] || oldStatus}</p>
              <p><strong>Trạng thái mới:</strong> ${statusLabels[newStatus] || newStatus}</p>
            </div>
            ${newStatus === 'banned' ? '<div class="warning"><strong>Cảnh báo:</strong> Tài khoản của bạn đã bị cấm. Vui lòng liên hệ với quản trị viên để biết thêm chi tiết.</div>' : ''}
            ${newStatus === 'active' ? '<div class="success"><strong>Chúc mừng:</strong> Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập và sử dụng các dịch vụ của chúng tôi.</div>' : ''}
            <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
            <p>Trân trọng,<br>Đội ngũ Quỹ Thắp Sáng Niềm Tin</p>
          </div>
          <div class="footer">
            <p>Email này được gửi tự động. Vui lòng không trả lời email này.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject,
      html,
    });
  }
}

