import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../iam/users.service';
import { CategoriesService } from '../cms/categories.service';
import { ArticlesService } from '../cms/articles.service';
import { UserDocument } from '../iam/schemas/user.schema';
import { CategoryDocument } from '../cms/schemas/category.schema';

/**
 * Script seed data
 * Chạy script này để thêm dữ liệu mẫu vào database
 *
 * Cách chạy:
 * npm run build
 * node dist/database/seed.js
 *
 * Hoặc với ts-node:
 * npx ts-node src/database/seed.ts
 */

async function bootstrap() {
  console.log('🌱 Bắt đầu seed data...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const categoriesService = app.get(CategoriesService);
  const articlesService = app.get(ArticlesService);

  try {
    // 1. Tạo Users
    console.log('📝 Đang tạo users...');
    const users: UserDocument[] = [];

    // Admin user
    try {
      const admin = await usersService.create({
        username: 'admin',
        email: 'admin@rika.vn',
        password: 'admin123',
        roles: ['admin'],
        status: 'active',
        full_name: 'Quản trị viên',
        phone: '0123456789',
      });
      users.push(admin);
      console.log('  ✅ Đã tạo admin user');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('  ⚠️  Admin user đã tồn tại hoặc có lỗi:', errorMessage);
      const existingAdmin = await usersService.findByUsernameOrEmail('admin');
      if (existingAdmin) users.push(existingAdmin);
    }

    // Editor user
    try {
      const editor = await usersService.create({
        username: 'editor',
        email: 'editor@rika.vn',
        password: 'editor123',
        roles: ['editor'],
        status: 'active',
        full_name: 'Biên tập viên',
        phone: '0987654321',
      });
      users.push(editor);
      console.log('  ✅ Đã tạo editor user');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('  ⚠️  Editor user đã tồn tại hoặc có lỗi:', errorMessage);
      const existingEditor = await usersService.findByUsernameOrEmail('editor');
      if (existingEditor) users.push(existingEditor);
    }

    // Normal user
    try {
      const user = await usersService.create({
        username: 'user',
        email: 'user@rika.vn',
        password: 'user123',
        roles: ['user'],
        status: 'active',
        full_name: 'Người dùng',
        phone: '0912345678',
      });
      users.push(user);
      console.log('  ✅ Đã tạo user');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('  ⚠️  User đã tồn tại hoặc có lỗi:', errorMessage);
      const existingUser = await usersService.findByUsernameOrEmail('user');
      if (existingUser) users.push(existingUser);
    }

    const adminUser = users.find((u) => u.roles.includes('admin'));
    const editorUser = users.find((u) => u.roles.includes('editor'));

    // 2. Tạo Categories
    console.log('\n📁 Đang tạo categories...');
    const categories: CategoryDocument[] = [];

    // Category cha: Tin tức
    let newsCategory: CategoryDocument | undefined;
    try {
      newsCategory = await categoriesService.create({
        name: 'Tin tức',
        slug: 'tin-tuc',
        type: 'news',
      });
      categories.push(newsCategory);
      console.log('  ✅ Đã tạo category: Tin tức');
    } catch {
      console.log('  ⚠️  Category "Tin tức" đã tồn tại');
      try {
        newsCategory = await categoriesService.findBySlug('tin-tuc');
        if (newsCategory) categories.push(newsCategory);
      } catch {
        console.log('  ❌ Không tìm thấy category "Tin tức"');
      }
    }

    // Category con: Tin tức chung
    try {
      const generalNews = await categoriesService.create({
        name: 'Tin tức chung',
        slug: 'tin-tuc-chung',
        type: 'news',
        parent_id: newsCategory?._id.toString(),
      });
      categories.push(generalNews);
      console.log('  ✅ Đã tạo category: Tin tức chung');
    } catch {
      console.log('  ⚠️  Category "Tin tức chung" đã tồn tại');
      try {
        const existing = await categoriesService.findBySlug('tin-tuc-chung');
        if (existing) categories.push(existing);
      } catch {
        // Category không tồn tại
      }
    }

    // Category: Thông báo
    let announcementCategory: CategoryDocument | undefined;
    try {
      announcementCategory = await categoriesService.create({
        name: 'Thông báo',
        slug: 'thong-bao',
        type: 'news',
      });
      categories.push(announcementCategory);
      console.log('  ✅ Đã tạo category: Thông báo');
    } catch {
      console.log('  ⚠️  Category "Thông báo" đã tồn tại');
      try {
        announcementCategory = await categoriesService.findBySlug('thong-bao');
        if (announcementCategory) categories.push(announcementCategory);
      } catch {
        // Category không tồn tại
      }
    }

    // 3. Tạo Articles
    console.log('\n📰 Đang tạo articles...');

    if (adminUser && categories.length > 0) {
      try {
        await articlesService.create(
          {
            title: 'Chào mừng đến với RiKa Portal System',
            slug: 'chao-mung-den-voi-rika-portal-system',
            content: `
              <h1>Chào mừng đến với RiKa Portal System</h1>
              <p>Đây là hệ thống quản lý portal được xây dựng với NestJS và MongoDB.</p>
              <p>Hệ thống hỗ trợ:</p>
              <ul>
                <li>Quản lý người dùng và phân quyền</li>
                <li>Quản lý nội dung (CMS)</li>
                <li>Diễn đàn thảo luận</li>
                <li>Quản lý tài chính</li>
                <li>Học bổng</li>
              </ul>
            `,
            category: categories[0]._id.toString(),
            tags: ['welcome', 'introduction'],
            status: 'published',
          },
          adminUser._id.toString(),
        );
        console.log(
          '  ✅ Đã tạo article: Chào mừng đến với RiKa Portal System',
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.log('  ⚠️  Article đã tồn tại hoặc có lỗi:', errorMessage);
      }

      try {
        await articlesService.create(
          {
            title: 'Hướng dẫn sử dụng hệ thống',
            slug: 'huong-dan-su-dung-he-thong',
            content: `
              <h1>Hướng dẫn sử dụng hệ thống</h1>
              <p>Đây là bài viết hướng dẫn cách sử dụng các tính năng của hệ thống.</p>
              <h2>Đăng nhập</h2>
              <p>Bạn có thể đăng nhập bằng username hoặc email kèm mật khẩu.</p>
              <h2>Quản lý nội dung</h2>
              <p>Người dùng có quyền editor hoặc admin có thể tạo và chỉnh sửa bài viết.</p>
            `,
            category: categories[0]._id.toString(),
            tags: ['guide', 'tutorial'],
            status: 'published',
          },
          editorUser?._id.toString() || adminUser._id.toString(),
        );
        console.log('  ✅ Đã tạo article: Hướng dẫn sử dụng hệ thống');
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.log('  ⚠️  Article đã tồn tại hoặc có lỗi:', errorMessage);
      }

      try {
        const categoryId =
          announcementCategory?._id.toString() ||
          categories[0]?._id.toString() ||
          newsCategory?._id.toString();
        if (!categoryId) {
          throw new Error('Không tìm thấy category để tạo article');
        }
        await articlesService.create(
          {
            title: 'Thông báo bảo trì hệ thống',
            slug: 'thong-bao-bao-tri-he-thong',
            content: `
              <h1>Thông báo bảo trì hệ thống</h1>
              <p>Hệ thống sẽ được bảo trì vào ngày mai từ 2:00 AM đến 4:00 AM.</p>
              <p>Trong thời gian này, hệ thống có thể không khả dụng.</p>
              <p>Xin cảm ơn sự thông cảm của quý khách.</p>
            `,
            category: categoryId,
            tags: ['announcement', 'maintenance'],
            status: 'published',
          },
          adminUser._id.toString(),
        );
        console.log('  ✅ Đã tạo article: Thông báo bảo trì hệ thống');
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.log('  ⚠️  Article đã tồn tại hoặc có lỗi:', errorMessage);
      }
    }

    console.log('\n✅ Seed data hoàn tất!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('  Admin:');
    console.log('    Username: admin');
    console.log('    Password: admin123');
    console.log('  Editor:');
    console.log('    Username: editor');
    console.log('    Password: editor123');
    console.log('  User:');
    console.log('    Username: user');
    console.log('    Password: user123');
  } catch (error) {
    console.error('❌ Lỗi khi seed data:', error);
    throw error;
  } finally {
    await app.close();
  }
}

void bootstrap();
