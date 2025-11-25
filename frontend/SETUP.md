# Hướng dẫn Setup Frontend

## Bước 1: Cài đặt dependencies

```bash
cd frontend
npm install
```

## Bước 2: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3001`

## Lưu ý

- Đảm bảo backend đang chạy tại `http://localhost:3000`
- Frontend tự động proxy API requests đến backend
- Nếu gặp lỗi TypeScript về "Cannot find module", hãy:
  1. Đảm bảo đã chạy `npm install`
  2. Restart TypeScript server trong VS Code (Ctrl+Shift+P -> "TypeScript: Restart TS Server")

## Build cho production

```bash
npm run build
```

File build sẽ nằm trong thư mục `dist/`

