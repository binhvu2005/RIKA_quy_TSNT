# Database Seed Script

Script này dùng để thêm dữ liệu mẫu vào database.

## Cách sử dụng

### Cách 1: Chạy trực tiếp với ts-node (khuyến nghị)

```bash
npm run seed
```

### Cách 2: Build và chạy

```bash
npm run build
node dist/database/seed.js
```

## Dữ liệu được tạo

### Users
- **Admin**: 
  - Username: `admin`
  - Password: `admin123`
  - Roles: `['admin']`
  
- **Editor**: 
  - Username: `editor`
  - Password: `editor123`
  - Roles: `['editor']`
  
- **User**: 
  - Username: `user`
  - Password: `user123`
  - Roles: `['user']`

### Categories
- Tin tức (parent)
- Tin tức chung (child của Tin tức)
- Thông báo

### Articles
- Chào mừng đến với RiKa Portal System
- Hướng dẫn sử dụng hệ thống
- Thông báo bảo trì hệ thống

## Lưu ý

- Script sẽ bỏ qua các dữ liệu đã tồn tại (không tạo trùng)
- Nếu dữ liệu đã tồn tại, script sẽ tìm và sử dụng dữ liệu đó
- Đảm bảo MongoDB đã được kết nối trước khi chạy script

