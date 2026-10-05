import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

// Environment variables the backend reads. Values come from docker-compose.yml;
// they are validated at startup and the app refuses to boot if any are invalid.
export class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3001;

  // require_protocol: without it, isUrl accepts any bare word as a hostname.
  @IsUrl({
    protocols: ['postgres', 'postgresql'],
    require_protocol: true,
    require_tld: false,
  })
  DATABASE_URL: string;

  // The only origin allowed to call the API from a browser (CORS).
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  FRONTEND_ORIGIN: string = 'http://localhost:3000';

  // HS256 signing secret for access tokens (at least 32 characters).
  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  // Access token lifetime. There is no refresh token: when it expires, the user logs in again.
  @IsInt()
  @Min(10)
  JWT_EXPIRES_IN_SECONDS: number = 3600;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Invalid environment variables:\n${errors.toString()}`);
  }
  return validated;
}
