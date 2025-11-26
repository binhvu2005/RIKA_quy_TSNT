import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

/**
 * Email Module
 * Module xử lý gửi email
 */
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Lấy và trim các biến môi trường (loại bỏ khoảng trắng thừa)
        const mailUser = configService.get<string>('MAIL_USER')?.trim() || '';
        const mailPassword =
          configService.get<string>('MAIL_PASSWORD')?.trim() || '';
        const mailHost =
          configService.get<string>('MAIL_HOST')?.trim() || 'smtp.gmail.com';
        const mailPort = configService.get<number>('MAIL_PORT') || 587;
        const mailFrom =
          configService.get<string>('MAIL_FROM')?.trim() || mailUser;
        const appName =
          configService.get<string>('APP_NAME')?.trim() ||
          'Quỹ Thắp Sáng Niềm Tin';

        // Debug: Log giá trị đã đọc được (ẩn password)
        console.log('🔍 Kiểm tra email configuration:');
        console.log(
          `   MAIL_USER: ${mailUser ? mailUser.substring(0, 3) + '***' : 'KHÔNG TỒN TẠI'}`,
        );
        console.log(
          `   MAIL_PASSWORD: ${mailPassword ? '***' : 'KHÔNG TỒN TẠI'}`,
        );
        console.log(`   MAIL_HOST: ${mailHost}`);
        console.log(`   MAIL_PORT: ${mailPort}`);

        // Chỉ cấu hình auth nếu có credentials
        interface TransportConfig {
          host: string;
          port: number;
          secure: boolean;
          tls: {
            rejectUnauthorized: boolean;
            ciphers: string;
          };
          connectionTimeout: number;
          timeout: number;
          greetingTimeout: number;
          socketTimeout: number;
          auth?: {
            user: string;
            pass: string;
          };
        }

        const transportConfig: TransportConfig = {
          host: mailHost,
          port: mailPort,
          secure: false, // true for 465, false for other ports
          tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3',
          },
          connectionTimeout: 5000,
          timeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        };

        // Kiểm tra credentials (không rỗng sau khi trim)
        const hasCredentials = mailUser.length > 0 && mailPassword.length > 0;

        if (hasCredentials) {
          transportConfig.auth = {
            user: mailUser,
            pass: mailPassword,
          };
          console.log('✅ Email service đã được cấu hình thành công');
          console.log(`   Host: ${mailHost}:${mailPort}`);
          console.log(`   From: ${mailFrom}`);
        } else {
          console.warn('⚠️  Email credentials không được cấu hình đúng.');
          if (!mailUser) {
            console.warn('   - MAIL_USER không tồn tại hoặc rỗng');
          }
          if (!mailPassword) {
            console.warn('   - MAIL_PASSWORD không tồn tại hoặc rỗng');
          }
          console.warn(
            '   Vui lòng kiểm tra file .env trong thư mục RIKA_Quy_TSNT',
          );
        }

        return {
          transport: transportConfig,
          defaults: {
            from: `"${appName}" <${mailFrom || 'noreply@example.com'}>`,
          },
          // Tắt logger để tránh log "Transporter is ready" như ERROR
          logger: false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
