import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Local Auth Guard
 * Sử dụng Local Strategy để xác thực
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

