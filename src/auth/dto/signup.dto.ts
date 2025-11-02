import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 25, description: 'User age', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Age must be at least 1' })
  @Max(150, { message: 'Age must be less than 150' })
  age?: number;

  @ApiProperty({ example: '+216 12345678', description: 'User phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Tunis, Tunisia', description: 'User address', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}