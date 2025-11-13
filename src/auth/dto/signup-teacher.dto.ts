import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignupTeacherDto {
  @ApiProperty({ example: 'Ms. Sarah Ahmed', description: 'Teacher full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'teacher@school.com', description: 'Teacher email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password (min 6 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Lincoln Elementary School', description: 'School name' })
  @IsString()
  @IsOptional()
  school?: string;

  @ApiPropertyOptional({ example: 'Grade 3', description: 'Grade/Class' })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiPropertyOptional({ example: '+21612345678', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;
}
