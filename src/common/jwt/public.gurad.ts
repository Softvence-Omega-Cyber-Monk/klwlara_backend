import { SetMetadata } from '@nestjs/common';

// The key 'isPublic' can be anything, just must match what the guard checks
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
