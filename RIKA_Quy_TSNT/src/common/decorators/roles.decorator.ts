import { SetMetadata } from '@nestjs/common';

/**
 * Key metadata cho roles decorator
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator để đánh dấu các endpoint cần quyền truy cập cụ thể
 * 
 * @param roles - Danh sách các role được phép truy cập
 * 
 * @example
 * @Roles('admin', 'editor')
 * @Get('admin-only')
 * adminOnly() {
 *   return 'This is admin only';
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

