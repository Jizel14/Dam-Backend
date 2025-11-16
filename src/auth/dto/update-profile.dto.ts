import { IsString, IsOptional, MinLength, IsNumber, Min, Max, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Updated', description: 'Updated name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'newemail@example.com', description: 'Updated email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+21698765432', description: 'Updated phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'New Address, Tunis', description: 'Updated address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 36, description: 'Updated age' })
  @IsNumber()
  @IsOptional()
  @Min(18)
  @Max(100)
  age?: number;

  @ApiPropertyOptional({ example: 'New School Name', description: 'Updated school (teachers only)' })
  @IsString()
  @IsOptional()
  school?: string;

  @ApiPropertyOptional({ example: 'Grade 4', description: 'Updated grade (teachers only)' })
  @IsString()
  @IsOptional()
  grade?: string;
}
