import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Admin User', description: 'Admin full name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@example.com', description: 'Admin email' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @ApiProperty({ example: 'adminpass123', description: 'Admin password', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Admin password must be at least 8 characters long' })
  password: string;
}