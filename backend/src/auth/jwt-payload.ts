import type { Request } from 'express';

// Claims we put into the access token.
export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
