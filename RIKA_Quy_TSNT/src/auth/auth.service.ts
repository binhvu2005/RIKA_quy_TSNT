import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { UsersService } from '../iam/users.service';
import { LoginDto } from '../iam/dto/login.dto';
import { UserProfile } from '../iam/schemas/user.schema';

/**
 * Validated User Interface
 * User object được trả về sau khi validate (không có password)
 */
export interface ValidatedUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  roles: string[];
  status: string;
  profile?: UserProfile;
  created_at?: Date;
}

/**
 * Auth Service
 * Xử lý logic xác thực và authorization
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Xác thực user với username/email và password
   * @param usernameOrEmail - Username hoặc email
   * @param password - Mật khẩu
   * @returns User object nếu hợp lệ, null nếu không
   */
  async validateUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<ValidatedUser | null> {
    // Tìm user theo username hoặc email
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);

    if (!user) {
      return null;
    }

    // Kiểm tra trạng thái user
    if (user.status !== 'active') {
      throw new UnauthorizedException(
        'Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt',
      );
    }

    // Xác thực mật khẩu
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    // Trả về user (không bao gồm password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } =
      user.toObject() as ValidatedUser & {
        password: string;
      };
    return result as ValidatedUser;
  }

  /**
   * Đăng nhập và tạo JWT token
   * @param loginDto - Thông tin đăng nhập
   * @returns Access token và user info
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.username_or_email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    // Tạo JWT payload
    const payload = {
      sub: String(user._id),
      username: user.username,
      email: user.email,
      roles: user.roles,
    };

    // Tạo access token
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        profile: user.profile,
      },
    };
  }

  /**
   * Xác thực JWT token và trả về user
   * @param token - JWT token
   * @returns User info từ token
   */
  verifyToken(token: string): {
    sub: string;
    username: string;
    email: string;
    roles: string[];
    iat?: number;
    exp?: number;
  } {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        username: string;
        email: string;
        roles: string[];
        iat?: number;
        exp?: number;
      }>(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
}
