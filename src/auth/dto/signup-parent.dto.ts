import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupParentDto {
  @ApiProperty({ example: 'John Doe', description: 'Parent full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'parent@example.com', description: 'Parent email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password (min 6 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '+21612345678', description: 'Phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Tunis, Tunisia', description: 'Address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 35, description: 'Age', required: false })
  @IsNumber()
  @IsOptional()
  age?: number;
}
