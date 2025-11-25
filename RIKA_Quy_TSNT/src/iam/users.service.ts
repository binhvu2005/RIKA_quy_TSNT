import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Users Service
 * Xử lý tất cả logic nghiệp vụ liên quan đến User
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Tạo user mới
   * @param createUserDto - Dữ liệu tạo user
   * @returns User đã tạo
   */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Kiểm tra username đã tồn tại
    const existingUser = await this.userModel.findOne({
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Username hoặc email đã tồn tại');
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Tạo user mới
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      profile: {
        full_name: createUserDto.full_name,
        phone: createUserDto.phone,
        identity: createUserDto.identity,
      },
    };

    // Loại bỏ các field không thuộc schema
    delete userData.full_name;
    delete userData.phone;
    delete userData.identity;

    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  /**
   * Tìm tất cả users với phân trang và filter
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @param search - Từ khóa tìm kiếm
   * @param status - Lọc theo trạng thái
   * @returns Danh sách users và metadata phân trang
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Tìm kiếm theo username, email hoặc full_name
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.full_name': { $regex: search, $options: 'i' } },
      ];
    }

    // Lọc theo trạng thái
    if (status) {
      query.status = status;
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password') // Loại bỏ password
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 })
        .exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tìm user theo ID
   * @param id - User ID
   * @returns User document
   */
  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }
    return user;
  }

  /**
   * Tìm user theo username hoặc email (dùng cho login)
   * @param usernameOrEmail - Username hoặc email
   * @returns User document (có password)
   */
  async findByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        $or: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      })
      .select('+password') // Bao gồm password
      .exec();
  }

  /**
   * Cập nhật user
   * @param id - User ID
   * @param updateUserDto - Dữ liệu cập nhật
   * @returns User đã cập nhật
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    // Kiểm tra user tồn tại
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    // Kiểm tra email/username trùng lặp (nếu có thay đổi)
    if (updateUserDto.email || updateUserDto.username) {
      const existingUser = await this.userModel.findOne({
        $or: [
          updateUserDto.email ? { email: updateUserDto.email } : {},
          updateUserDto.username ? { username: updateUserDto.username } : {},
        ],
        _id: { $ne: id },
      });

      if (existingUser) {
        throw new ConflictException('Email hoặc username đã được sử dụng');
      }
    }

    // Cập nhật profile nếu có
    if (
      updateUserDto.full_name ||
      updateUserDto.phone ||
      updateUserDto.identity ||
      updateUserDto.avatar
    ) {
      updateUserDto['profile'] = {
        ...user.profile,
        ...(updateUserDto.full_name && { full_name: updateUserDto.full_name }),
        ...(updateUserDto.phone && { phone: updateUserDto.phone }),
        ...(updateUserDto.identity && { identity: updateUserDto.identity }),
        ...(updateUserDto.avatar && { avatar: updateUserDto.avatar }),
      };
      delete updateUserDto.full_name;
      delete updateUserDto.phone;
      delete updateUserDto.identity;
      delete updateUserDto.avatar;
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User không tồn tại');
    }

    return updatedUser;
  }

  /**
   * Xóa user (soft delete - chỉ đổi status)
   * @param id - User ID
   */
  async remove(id: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    // Soft delete - đổi status thành banned
    user.status = 'banned';
    await user.save();
  }

  /**
   * Xóa user vĩnh viễn
   * @param id - User ID
   */
  async hardDelete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }
  }

  /**
   * Cập nhật mật khẩu
   * @param id - User ID
   * @param newPassword - Mật khẩu mới
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(id, { password: hashedPassword });
  }

  /**
   * Đổi mật khẩu (có validate mật khẩu hiện tại)
   * @param id - User ID
   * @param currentPassword - Mật khẩu hiện tại
   * @param newPassword - Mật khẩu mới
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Lấy user với password
    const user = await this.userModel.findById(id).select('+password');
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Validate mật khẩu hiện tại
    const isPasswordValid = await this.validatePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    // Cập nhật mật khẩu mới
    await this.updatePassword(id, newPassword);
  }

  /**
   * Xác thực mật khẩu
   * @param plainPassword - Mật khẩu gốc
   * @param hashedPassword - Mật khẩu đã hash
   * @returns true nếu khớp
   */
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Xuất danh sách users ra Excel (placeholder)
   * @param filters - Bộ lọc
   * @returns Buffer chứa file Excel
   */
  async exportToExcel(filters?: any): Promise<Buffer> {
    // TODO: Implement export to Excel
    throw new Error('Chức năng xuất Excel chưa được triển khai');
  }

  /**
   * Nhập danh sách users từ Excel (placeholder)
   * @param file - File Excel
   */
  async importFromExcel(file: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer?: Buffer;
  }): Promise<void> {
    // TODO: Implement import from Excel
    throw new Error('Chức năng nhập Excel chưa được triển khai');
  }
}

