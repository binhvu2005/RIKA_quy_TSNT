import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Setup MongoDB connection event listeners
function setupMongoListeners(connection: Connection) {
  connection.on('connected', () => {
    console.log('✅ MongoDB đã kết nối thành công!');
  });
  connection.on('error', (err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
  });
  connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB đã ngắt kết nối');
  });
}

/**
 * Bootstrap function
 * Khởi tạo và cấu hình NestJS application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Global prefix cho tất cả routes
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các property không có trong DTO
      forbidNonWhitelisted: true, // Throw error nếu có property không hợp lệ
      transform: true, // Tự động transform type
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 3000;
  
  // Setup MongoDB connection event listeners
  try {
    const connection = app.get<Connection>(getConnectionToken());
    setupMongoListeners(connection);
    
    if (connection.readyState === 1) {
      console.log('✅ MongoDB đã sẵn sàng');
    } else {
      console.warn(`⚠️  MongoDB trạng thái: ${connection.readyState === 0 ? 'Chưa kết nối' : 'Đang kết nối'}`);
    }
  } catch (error) {
    console.warn('⚠️  Không thể kiểm tra trạng thái MongoDB');
  }
  
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
bootstrap();
