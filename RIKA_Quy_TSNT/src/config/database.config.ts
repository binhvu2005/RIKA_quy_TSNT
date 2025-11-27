import { registerAs } from '@nestjs/config';

/**
 * Cấu hình kết nối MongoDB
 * Sử dụng registerAs để tạo namespace config
 */
export default registerAs('database', () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rika_portal';
  
  // Kiểm tra nếu là MongoDB Atlas (có chứa mongodb.net)
  const isAtlas = uri.includes('mongodb.net');
  
  return {
    uri,
    options: {
      // Tùy chọn kết nối MongoDB
      maxPoolSize: 10, // Số lượng kết nối tối đa trong pool
      minPoolSize: 2, // Số lượng kết nối tối thiểu
      socketTimeoutMS: 45000, // Timeout cho socket
      serverSelectionTimeoutMS: isAtlas ? 60000 : 30000, // Atlas cần timeout dài hơn (60 giây)
      connectTimeoutMS: isAtlas ? 60000 : 30000, // Atlas cần timeout dài hơn (60 giây)
      retryWrites: true, // Retry writes nếu fail
      retryReads: true, // Retry reads nếu fail
      // Tùy chọn cho MongoDB Atlas
      ...(isAtlas && {
        tls: true, // Bật TLS cho Atlas
        tlsAllowInvalidCertificates: false, // Không cho phép certificate không hợp lệ
      }),
    },
  };
});

