import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';

// Import các modules
import { IamModule } from './iam/iam.module';
import { AuthModule } from './auth/auth.module';
import { CmsModule } from './cms/cms.module';
import { ForumModule } from './forum/forum.module';
import { FinanceModule } from './finance/finance.module';
import { ScholarshipModule } from './scholarship/scholarship.module';
import { SystemModule } from './system/system.module';
import { UploadModule } from './common/modules/upload.module';

/**
 * App Module
 * Module chính của ứng dụng, import tất cả các modules khác
 */
@Module({
  imports: [
    // Config Module - Load environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Làm cho ConfigModule available globally
      load: [databaseConfig], // Load database config
      // Thử nhiều đường dẫn .env (từ root project)
      envFilePath: [
        join(__dirname, '..', '.env'), // Từ dist folder khi build
        join(process.cwd(), '.env'), // Từ current working directory
        '.env', // Relative path
      ],
      expandVariables: true, // Cho phép sử dụng biến trong .env
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigService,
      ): {
        uri: string;
        maxPoolSize?: number;
        minPoolSize?: number;
        socketTimeoutMS?: number;
        serverSelectionTimeoutMS?: number;
        connectTimeoutMS?: number;
        retryWrites?: boolean;
        retryReads?: boolean;
      } => {
        const uri = configService.get<string>('database.uri');
        const options = configService.get<{
          maxPoolSize?: number;
          minPoolSize?: number;
          socketTimeoutMS?: number;
          serverSelectionTimeoutMS?: number;
          connectTimeoutMS?: number;
          retryWrites?: boolean;
          retryReads?: boolean;
        }>('database.options');

        console.log('📡 Đang kết nối MongoDB...');
        console.log(`   URI: ${uri?.replace(/\/\/.*@/, '//***:***@')}`); // Ẩn password trong log

        return {
          uri: uri || 'mongodb://localhost:27017/rika_portal',
          ...options,
        };
      },
      inject: [ConfigService],
    }),

    // Application Modules
    IamModule, // Module quản lý người dùng
    AuthModule, // Module xác thực
    CmsModule, // Module quản lý nội dung
    ForumModule, // Module diễn đàn
    FinanceModule, // Module tài chính
    ScholarshipModule, // Module học bổng
    SystemModule, // Module hệ thống
    UploadModule, // Module upload file
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
