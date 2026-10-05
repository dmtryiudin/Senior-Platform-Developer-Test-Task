import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

// Login only requires both fields to be present; no format or strength rules.
export class LoginDto {
  // Emails are stored lowercased, so normalize before the lookup.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
