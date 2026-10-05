import { SetMetadata } from '@nestjs/common';

// Every route requires a valid access token (global AuthGuard);
// @Public() opts a route or controller out.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
