import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 'Colors Around Us', description: 'Lesson title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Learn basic colors through everyday objects', description: 'Lesson description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '4-6', enum: ['4-6', '7-9', '10-12'], description: 'Target age group' })
  @IsEnum(['4-6', '7-9', '10-12'])
  level: string;

  @ApiProperty({ example: 'colors', description: 'Lesson category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: ['wordId1', 'wordId2'], description: 'Target vocabulary word IDs', required: false })
  @IsArray()
  @IsOptional()
  targetWords?: string[];

  @ApiProperty({ example: { intro: 'Today we learn colors...', objectives: ['Identify 5 colors'] }, required: false })
  @IsObject()
  @IsOptional()
  content?: object;

  @ApiProperty({ example: 20, description: 'Duration in minutes', required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ example: 'https://...', description: 'Cover image URL', required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({ example: true, description: 'Make lesson public', required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
