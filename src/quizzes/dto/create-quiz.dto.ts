import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class QuizQuestionDto {
  @ApiProperty({ example: 'multiple-choice', enum: ['multiple-choice', 'pronunciation', 'match', 'fill-blank'] })
  @IsEnum(['multiple-choice', 'pronunciation', 'match', 'fill-blank'])
  type: string;

  @ApiProperty({ example: 'What color is the sky?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: ['Red', 'Blue', 'Green', 'Yellow'], required: false })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiProperty({ example: 'Blue' })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @ApiProperty({ example: 'wordId123', required: false })
  @IsString()
  @IsOptional()
  wordId?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  points: number;
}

export class CreateQuizDto {
  @ApiProperty({ example: 'Colors Quiz', description: 'Quiz title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '4-6', enum: ['4-6', '7-9', '10-12'] })
  @IsEnum(['4-6', '7-9', '10-12'])
  level: string;

  @ApiProperty({ type: [QuizQuestionDto], description: 'Array of quiz questions' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];

  @ApiProperty({ example: 'lessonId123', required: false })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiProperty({ example: 10, description: 'Time limit in minutes', required: false })
  @IsNumber()
  @IsOptional()
  timeLimit?: number;
}
