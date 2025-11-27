import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { EmailModule } from '../common/modules/email.module';
import { CommonModule } from '../common/common.module';

/**
 * IAM Module (Identity and Access Management)
 * Module quản lý người dùng và xác thực
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EmailModule, // Import để gửi email thông báo khi thay đổi role/status
    CommonModule, // Import để sử dụng ExcelService
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export để các module khác sử dụng
})
export class IamModule {}

