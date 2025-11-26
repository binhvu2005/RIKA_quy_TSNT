import { registerAs } from '@nestjs/config';

/**
 * Cấu hình kết nối MongoDB
 * Sử dụng registerAs để tạo namespace config
 */
export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rika_portal',
  options: {
    // Tùy chọn kết nối MongoDB
    maxPoolSize: 10, // Số lượng kết nối tối đa trong pool
    minPoolSize: 2, // Số lượng kết nối tối thiểu
    socketTimeoutMS: 45000, // Timeout cho socket
    serverSelectionTimeoutMS: 30000, // Timeout khi chọn server (30 giây)
    connectTimeoutMS: 30000, // Timeout khi kết nối (30 giây)
    retryWrites: true, // Retry writes nếu fail
    retryReads: true, // Retry reads nếu fail
  },
}));

