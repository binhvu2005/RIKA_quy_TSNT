import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, ValidatedUser } from '../auth.service';

/**
 * Local Strategy
 * Xác thực user bằng username/email và password
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username_or_email', // Cho phép dùng username hoặc email
    });
  }

  /**
   * Validate user credentials
   * @param usernameOrEmail - Username hoặc email
   * @param password - Mật khẩu
   * @returns User object nếu hợp lệ
   */
  async validate(
    usernameOrEmail: string,
    password: string,
  ): Promise<ValidatedUser> {
    const user = await this.authService.validateUser(usernameOrEmail, password);
    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }
    return user;
  }
}
