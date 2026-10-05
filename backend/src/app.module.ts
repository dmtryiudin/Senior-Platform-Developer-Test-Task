import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { EnvironmentVariables, validate } from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';
import { SeedModule } from './seed/seed.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    // Env vars are provided by docker compose, so no .env file is loaded here.
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL', { infer: true }),
        // Entities registered via TypeOrmModule.forFeature() are picked up automatically.
        autoLoadEntities: true,
        // Dev-only project: schema is synced from entities, no migrations.
        synchronize: true,
      }),
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    SeedModule,
  ],
})
export class AppModule {}
