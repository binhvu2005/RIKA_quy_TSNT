import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator để lấy thông tin user hiện tại từ request
 * Sử dụng trong controller để inject user đã được authenticate
 * 
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

