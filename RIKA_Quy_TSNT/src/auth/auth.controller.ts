import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../iam/dto/login.dto';
import { CreateUserDto } from '../iam/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../iam/users.service';

/**
 * Auth Controller
 * Xử lý các request liên quan đến xác thực
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Đăng nhập
   * POST /auth/login
   * Public endpoint - không cần authentication
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @CurrentUser() user: any) {
    // User đã được validate bởi LocalAuthGuard
    return this.authService.login(loginDto);
  }

  /**
   * Đăng ký tài khoản mới
   * POST /auth/register
   * Public endpoint - không cần authentication
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      // Đảm bảo user mới có status 'pending' và role 'user'
      const registerData = {
        ...createUserDto,
        status: 'pending',
        roles: ['user'],
      };

      const user = await this.usersService.create(registerData);
      
      // Loại bỏ password khỏi response
      const { password, ...userResponse } = user.toObject();
      
      return {
        message: 'Đăng ký thành công! Vui lòng đợi quản trị viên phê duyệt tài khoản.',
        data: userResponse,
      };
    } catch (error: any) {
      // Nếu là lỗi validation hoặc conflict, throw để filter xử lý
      throw error;
    }
  }

  /**
   * Lấy thông tin user hiện tại từ token
   * GET /auth/me
   */
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}

