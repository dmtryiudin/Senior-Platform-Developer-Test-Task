import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { hash } from 'argon2';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity.js';
import { SEED_USERS } from './seed-users.js';

// Fills an empty database on startup. Runs after TypeORM has synced the schema;
// if any table already has rows, it does nothing. To re-seed: `docker compose down -v`.
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!(await this.isDatabaseEmpty())) {
      this.logger.log('Database not empty, skipping seed');
      return;
    }

    const users = await Promise.all(
      SEED_USERS.map(async ({ email, password }) => ({
        email,
        passwordHash: await hash(password),
      })),
    );
    // One transaction: either every seed user is created or none.
    await this.dataSource.transaction((manager) => manager.insert(User, users));
    this.logger.log(`Seeded ${users.length} users`);
  }

  private async isDatabaseEmpty(): Promise<boolean> {
    for (const { target } of this.dataSource.entityMetadatas) {
      if (await this.dataSource.getRepository(target).exists()) {
        return false;
      }
    }
    return true;
  }
}
