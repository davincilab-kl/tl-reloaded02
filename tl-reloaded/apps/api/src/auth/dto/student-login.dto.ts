import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class StudentLoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  password: string;
}
