import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  // The only query that loads the password hash: used for login.
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.users.findOne({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.users.findOneBy({ id });
  }
}
