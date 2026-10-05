import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { AuthService, type LoginResponse } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './jwt-payload.js';
import { Public } from './public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.signIn(dto.email, dto.password);
  }

  // The signed-in user. Loaded from the DB, so a deleted user gets a 401
  // even while their token hasn't expired yet.
  @Get('me')
  async me(
    @CurrentUser() payload: JwtPayload,
  ): Promise<{ id: string; email: string }> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email };
  }
}
