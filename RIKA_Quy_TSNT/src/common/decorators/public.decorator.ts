import { SetMetadata } from '@nestjs/common';

/**
 * Key metadata cho public decorator
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator để đánh dấu route là public (không cần authentication)
 * 
 * @example
 * @Public()
 * @Post('login')
 * login() {
 *   return 'This is a public endpoint';
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

