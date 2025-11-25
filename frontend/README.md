# Quỹ thắp sáng niềm tin - Frontend

Frontend Vue 3 application cho Quỹ thắp sáng niềm tin với giao diện đẹp và animations mượt mà.

## 🚀 Tính năng

- ✅ Trang người dùng đầy đủ (Home, Articles, Forum, Scholarships, Profile)
- ✅ Trang Admin Dashboard với đầy đủ chức năng quản lý
- ✅ Authentication & Authorization
- ✅ Animations mượt mà với Tailwind CSS
- ✅ Responsive design
- ✅ TypeScript support
- ✅ State management với Pinia
- ✅ API integration với backend NestJS

## 📦 Cài đặt

```bash
cd frontend
npm install
```

## 🏃 Chạy ứng dụng

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

Ứng dụng sẽ chạy tại: `http://localhost:3001`

## 🏗️ Cấu trúc dự án

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── layout/      # Header, Footer
│   │   └── admin/       # Admin components
│   ├── views/           # Page components
│   │   ├── user/        # User pages
│   │   ├── admin/       # Admin pages
│   │   └── auth/        # Auth pages
│   ├── layouts/         # Layout components
│   ├── router/          # Vue Router config
│   ├── stores/          # Pinia stores
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   └── style.css        # Global styles
├── index.html
└── package.json
```

## 🔌 API Integration

Frontend tự động proxy requests đến backend tại `http://localhost:3000/api` thông qua Vite proxy config.

## 🎨 Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Custom animations** - Fade, slide, bounce effects
- **Responsive design** - Mobile-first approach

## 📝 Các trang chính

### User Pages
- `/` - Trang chủ
- `/articles` - Danh sách bài viết
- `/articles/:slug` - Chi tiết bài viết
- `/forum` - Diễn đàn
- `/scholarships` - Học bổng
- `/profile` - Hồ sơ cá nhân
- `/login` - Đăng nhập

### Admin Pages
- `/admin` - Dashboard
- `/admin/users` - Quản lý người dùng
- `/admin/articles` - Quản lý bài viết
- `/admin/categories` - Quản lý danh mục
- `/admin/forum` - Quản lý diễn đàn
- `/admin/finance` - Quản lý tài chính
- `/admin/scholarships` - Quản lý học bổng
- `/admin/settings` - Cài đặt hệ thống

## 🔐 Authentication

- JWT token được lưu trong localStorage
- Auto refresh token khi cần
- Protected routes với route guards
- Role-based access control

## 🎯 Next Steps

1. Hoàn thiện các trang còn lại (Forum, Scholarships, Profile, etc.)
2. Thêm rich text editor cho tạo/sửa bài viết
3. Thêm file upload cho media
4. Thêm real-time notifications
5. Thêm dark mode

