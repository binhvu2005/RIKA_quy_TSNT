import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard
 * Kiểm tra quyền truy cập dựa trên roles của user
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách roles yêu cầu từ decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Nếu không có yêu cầu role nào thì cho phép truy cập
    if (!requiredRoles) {
      return true;
    }

    // Lấy user từ request (đã được set bởi JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Kiểm tra user có ít nhất một role trong danh sách yêu cầu
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}

