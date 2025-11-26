import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { IamModule } from '../iam/iam.module';
import { EmailModule } from '../common/modules/email.module';
import { Otp, OtpSchema } from './schemas/otp.schema';

/**
 * Auth Module
 * Module xử lý xác thực và authorization
 */
@Module({
  imports: [
    IamModule, // Import để sử dụng UsersService
    EmailModule, // Import để gửi email OTP
    PassportModule,
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

