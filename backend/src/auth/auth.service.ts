import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { UsersService } from '../users/users.service.js';
import type { JwtPayload } from './jwt-payload.js';

export interface LoginResponse {
  accessToken: string;
  // Seconds until the token expires; the frontend uses it as the session cookie lifetime.
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async signIn(email: string, password: string): Promise<LoginResponse> {
    const user = await this.usersService.findByEmailWithPassword(email);
    const valid = user ? await verify(user.passwordHash, password) : false;
    if (!user || !valid) {
      // Same answer for an unknown email and a wrong password.
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: this.config.get('JWT_EXPIRES_IN_SECONDS', { infer: true }),
    };
  }
}
