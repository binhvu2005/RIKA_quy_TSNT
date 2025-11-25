# MongoDB Collections - Tự động tạo như Hibernate?

## So sánh MongoDB vs Hibernate

### Hibernate (Java/Spring Boot)
- **Tự động tạo bảng**: Có thể tự động tạo bảng khi ứng dụng khởi động (nếu config `spring.jpa.hibernate.ddl-auto=create` hoặc `update`)
- **Tạo ngay khi start**: Bảng được tạo ngay khi ứng dụng khởi động, dựa trên Entity classes
- **Cần config**: Phải cấu hình trong `application.properties`

### MongoDB + Mongoose (Node.js/NestJS)
- **Tự động tạo collection**: ✅ CÓ, nhưng khác cách hoạt động
- **Tạo khi lưu document đầu tiên**: Collection chỉ được tạo khi bạn lưu document đầu tiên vào collection đó
- **Không cần config**: Tự động, không cần cấu hình gì thêm

## Cách hoạt động trong dự án này

### 1. Định nghĩa Schema
```typescript
// src/iam/schemas/user.schema.ts
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class User {
  @Prop({ type: String, required: true, unique: true })
  username: string;
  // ...
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### 2. Đăng ký Schema trong Module
```typescript
// src/iam/iam.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }, // Collection: "users"
    ]),
  ],
})
```

### 3. Collection được tạo tự động
- **Khi nào**: Khi bạn lưu document đầu tiên
  ```typescript
  const user = new this.userModel({ username: 'admin', ... });
  await user.save(); // ← Collection "users" được tạo tại đây
  ```

- **Tên collection**: Tự động chuyển từ tên class (User → users, Article → articles)
  - `User` → collection `users`
  - `Article` → collection `articles`
  - `Category` → collection `categories`

## Ví dụ trong dự án

### Chạy seed script để tạo collections
```bash
npm run seed
```

Script này sẽ:
1. Tạo User đầu tiên → Collection `users` được tạo tự động
2. Tạo Category đầu tiên → Collection `categories` được tạo tự động
3. Tạo Article đầu tiên → Collection `articles` được tạo tự động

### Hoặc khi sử dụng API
```bash
POST /api/users
# Lần đầu tiên tạo user → Collection "users" được tạo tự động
```

## Indexes

MongoDB/Mongoose cũng tự động tạo indexes khi định nghĩa trong schema:

```typescript
@Prop({ type: String, unique: true, index: true })
username: string;

// Hoặc tạo index thủ công
UserSchema.index({ username: 1, email: 1 });
UserSchema.index({ 'profile.full_name': 'text' });
```

Indexes được tạo khi:
- Collection được tạo lần đầu
- Hoặc khi ứng dụng khởi động (nếu collection đã tồn tại)

## Tóm tắt

| Tính năng | Hibernate | MongoDB + Mongoose |
|-----------|-----------|-------------------|
| Tự động tạo | ✅ Có (khi start app) | ✅ Có (khi lưu document đầu tiên) |
| Thời điểm | Khi ứng dụng khởi động | Khi lưu document đầu tiên |
| Cần config | ✅ Cần (`ddl-auto`) | ❌ Không cần |
| Tên collection/table | Từ `@Table` hoặc tên class | Từ tên class (số nhiều) |

## Lưu ý

1. **Database phải tồn tại**: MongoDB sẽ tự tạo database nếu chưa có khi kết nối
2. **Collection rỗng**: Nếu xóa hết documents, collection vẫn tồn tại (chỉ rỗng)
3. **Indexes**: Được tạo tự động khi collection được tạo hoặc khi app start
4. **Validation**: Mongoose schema validation chỉ áp dụng khi lưu document

## Kết luận

✅ **MongoDB/Mongoose CÓ tự tạo collections**, nhưng:
- Khác Hibernate: Tạo khi lưu document đầu tiên, không phải khi start app
- Đơn giản hơn: Không cần config gì, tự động hoàn toàn
- Linh hoạt hơn: Schema có thể thay đổi dễ dàng (schema-less nature của MongoDB)

