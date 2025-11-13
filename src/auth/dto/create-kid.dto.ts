import { IsNotEmpty, IsString, IsEnum, IsOptional, Min, Max, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKidDto {
  @ApiProperty({ example: 'Nour', description: 'Kid first name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'kid123', description: 'Username for kid login' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'avatar_1.png', description: 'Avatar image URL', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ example: 7, description: 'Kid age (4-12)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(4)
  @Max(12)
  age: number;

  @ApiProperty({ example: '4-6', description: 'Level group', enum: ['4-6', '7-9', '10-12'] })
  @IsEnum(['4-6', '7-9', '10-12'])
  level: string;

  @ApiProperty({ example: 'Grade 2', description: 'Current grade', required: false })
  @IsString()
  @IsOptional()
  grade?: string;
}
