import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { UserRole, PreferredTitle } from '@repo/db/types';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(PreferredTitle)
  @IsOptional()
  preferredTitle?: PreferredTitle;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be in international format (e.g., +436991234567)' })
  phone?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.teacher;
}
