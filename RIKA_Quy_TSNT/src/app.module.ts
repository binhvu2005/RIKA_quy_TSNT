import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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
      envFilePath: '.env', // Đường dẫn file .env
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        const options = configService.get<any>('database.options');
        
        console.log('📡 Đang kết nối MongoDB...');
        console.log(`   URI: ${uri?.replace(/\/\/.*@/, '//***:***@')}`); // Ẩn password trong log
        
        return {
          uri,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
