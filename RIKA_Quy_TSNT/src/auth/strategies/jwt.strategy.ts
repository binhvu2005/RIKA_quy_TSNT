import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../iam/users.service';
import { UserDocument } from '../../iam/schemas/user.schema';

/**
 * JWT Payload Interface
 */
interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  roles: string[];
}

/**
 * JWT Strategy
 * Xác thực user dựa trên JWT token
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    const secretOrKey: string = jwtSecret ?? 'your-secret-key';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  /**
   * Validate payload từ JWT token
   * @param payload - Payload từ JWT token (chứa user info)
   * @returns User object được attach vào request
   */
  async validate(payload: JwtPayload): Promise<{
    _id: any;
    username: string;
    email: string;
    roles: string[];
    status: string;
  }> {
    // Tìm user từ database
    let user: UserDocument;
    try {
      user = await this.usersService.findOne(payload.sub);
    } catch {
      throw new UnauthorizedException('User không tồn tại hoặc đã bị khóa');
    }

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User không tồn tại hoặc đã bị khóa');
    }

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      status: user.status,
    };
  }
}
