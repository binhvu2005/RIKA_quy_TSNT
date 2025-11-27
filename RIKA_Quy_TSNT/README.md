# RiKa Portal System - Backend API

Hệ thống quản lý portal với NestJS và MongoDB, được xây dựng theo cấu trúc database specification.

## 📋 Mục lục

- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Modules](#modules)

## 🚀 Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18.x
- MongoDB >= 5.x
- npm 

### Cài đặt dependencies

```bash
cd RIKA_Quy_TSNT
npm install
```

### Tạo file .env

Tạo file `.env` trong thư mục `RIKA_Quy_TSNT` với nội dung (hoặc copy từ `.env.example`):

**Cho MongoDB Atlas (khuyến nghị):**
```env
# Database Configuration - MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rika_portal?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=7d

# Application
APP_NAME=RiKa Portal System
APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
```

**Cho MongoDB Local:**
```env
MONGODB_URI=mongodb://localhost:27017/rika_portal
```

**Lưu ý khi sử dụng MongoDB Atlas:**
1. Thay `username`, `password`, `cluster` bằng thông tin thực tế từ MongoDB Atlas
2. Đảm bảo IP của bạn đã được whitelist trong MongoDB Atlas (Network Access)
3. Đảm bảo database user đã được tạo với quyền đọc/ghi

## ⚙️ Cấu hình

### Chạy ứng dụng

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Ứng dụng sẽ chạy tại: `http://localhost:3000/api`

## 📁 Cấu trúc dự án

```
src/
├── auth/                    # Module xác thực
│   ├── strategies/          # JWT và Local strategies
│   ├── guards/              # Auth guards
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── auth.module.ts
├── iam/                     # Module quản lý người dùng
│   ├── schemas/             # User schema
│   ├── dto/                 # Data Transfer Objects
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── iam.module.ts
├── cms/                     # Module quản lý nội dung
│   ├── schemas/             # Category, Article schemas
│   ├── dto/
│   ├── categories.service.ts
│   ├── articles.service.ts
│   └── cms.module.ts
├── forum/                   # Module diễn đàn
│   ├── schemas/             # ForumThread, Comment, Reaction schemas
│   ├── dto/
│   ├── forum-threads.service.ts
│   ├── comments.service.ts
│   ├── reactions.service.ts
│   └── forum.module.ts
├── finance/                 # Module tài chính
│   ├── schemas/             # Fund, FinanceTransaction schemas
│   ├── dto/
│   ├── funds.service.ts
│   ├── finance-transactions.service.ts
│   └── finance.module.ts
├── scholarship/             # Module học bổng
│   ├── schemas/             # Scholarship, ScholarshipApplication schemas
│   ├── dto/
│   ├── scholarships.service.ts
│   ├── scholarship-applications.service.ts
│   └── scholarship.module.ts
├── system/                  # Module hệ thống
│   ├── schemas/             # SystemSetting, MediaFile, AuditLog schemas
│   ├── system-settings.service.ts
│   ├── media-files.service.ts
│   ├── audit-logs.service.ts
│   └── system.module.ts
├── common/                  # Common utilities
│   ├── decorators/          # Custom decorators
│   ├── guards/              # Guards
│   ├── filters/             # Exception filters
│   └── interceptors/        # Interceptors
├── config/                  # Configuration files
│   └── database.config.ts
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/me` - Lấy thông tin user hiện tại

### Users (IAM)

- `GET /api/users` - Lấy danh sách users (Admin/Editor)
- `GET /api/users/:id` - Lấy thông tin user (Admin/Editor)
- `GET /api/users/me` - Lấy thông tin user hiện tại
- `POST /api/users` - Tạo user mới (Admin)
- `PATCH /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user (Admin)

### Categories (CMS)

- `GET /api/categories` - Lấy danh sách categories (Public)
- `GET /api/categories/:id` - Lấy category theo ID (Public)
- `POST /api/categories` - Tạo category (Admin/Editor)
- `PATCH /api/categories/:id` - Cập nhật category (Admin/Editor)
- `DELETE /api/categories/:id` - Xóa category (Admin)

### Articles (CMS)

- `GET /api/articles` - Lấy danh sách articles (Public)
- `GET /api/articles/:id` - Lấy article theo ID (Public)
- `GET /api/articles/slug/:slug` - Lấy article theo slug (Public)
- `POST /api/articles` - Tạo article (Admin/Editor)
- `PATCH /api/articles/:id` - Cập nhật article
- `DELETE /api/articles/:id` - Xóa article

### Forum

- `GET /api/forum/threads` - Lấy danh sách threads (Public)
- `GET /api/forum/threads/:id` - Lấy thread theo ID (Public)
- `POST /api/forum/threads` - Tạo thread (Auth required)
- `PATCH /api/forum/threads/:id` - Cập nhật thread
- `DELETE /api/forum/threads/:id` - Xóa thread

### Comments

- `GET /api/comments?target_model=Article&target_id=xxx` - Lấy comments (Public)
- `POST /api/comments` - Tạo comment (Auth required)
- `PATCH /api/comments/:id` - Cập nhật comment
- `DELETE /api/comments/:id` - Xóa comment

### Reactions

- `POST /api/reactions` - Tạo/update reaction (Auth required)
- `GET /api/reactions?target_model=Article&target_id=xxx` - Lấy reactions (Public)

### Finance

- `GET /api/funds` - Lấy danh sách funds (Admin/Editor)
- `POST /api/funds` - Tạo fund (Admin)
- `GET /api/finance/transactions` - Lấy danh sách transactions (Admin/Editor)
- `POST /api/finance/transactions` - Tạo transaction (Admin/Editor)

### Scholarship

- `GET /api/scholarships` - Lấy danh sách scholarships (Public)
- `POST /api/scholarships` - Tạo scholarship (Admin)
- `GET /api/scholarship-applications` - Lấy danh sách applications
- `POST /api/scholarship-applications` - Nộp đơn học bổng

### System

- `GET /api/system/settings` - Lấy tất cả settings (Admin)
- `POST /api/system/settings` - Tạo/update setting (Admin)
- `GET /api/media/files` - Lấy danh sách media files
- `POST /api/media/files/upload` - Upload file
- `GET /api/system/audit-logs` - Lấy audit logs (Admin)

## 🔐 Authentication

API sử dụng JWT (JSON Web Token) để xác thực. Sau khi đăng nhập thành công, bạn sẽ nhận được `access_token`. Sử dụng token này trong header:

```
Authorization: Bearer <access_token>
```

### Roles

- `admin` - Quản trị viên, có toàn quyền
- `editor` - Biên tập viên, có quyền quản lý nội dung
- `user` - Người dùng thông thường

## 📦 Modules

### 1. IAM Module (Identity and Access Management)
- Quản lý users
- Phân quyền
- Profile management

### 2. CMS Module (Content Management System)
- Quản lý categories (cây thư mục đa cấp)
- Quản lý articles với rich text editor
- Tìm kiếm và filter

### 3. Forum Module
- Forum threads
- Comments (polymorphic - cho cả Article và ForumThread)
- Reactions (like, love, etc.)

### 4. Finance Module
- Quản lý funds (quỹ)
- Finance transactions (thu/chi)
- Sử dụng Decimal128 cho độ chính xác tiền tệ

### 5. Scholarship Module
- Quản lý đợt học bổng
- Scholarship applications
- Hệ thống chấm điểm linh hoạt

### 6. System Module
- System settings (key-value)
- Media files management
- Audit logs (tự động xóa sau 1 năm)

## 🛠️ Công nghệ sử dụng

- **NestJS** - Framework Node.js
- **MongoDB** - NoSQL Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **class-validator** - Validation
- **class-transformer** - Transformation

## 📝 Ghi chú

- Tất cả các trường tiền tệ sử dụng `Decimal128` để đảm bảo độ chính xác
- Audit logs tự động xóa sau 1 năm (TTL index)
- Comments và Reactions hỗ trợ polymorphic (có thể dùng cho nhiều loại đối tượng)
- Categories hỗ trợ cây thư mục đa cấp với ancestors array

## 📄 License

UNLICENSED
