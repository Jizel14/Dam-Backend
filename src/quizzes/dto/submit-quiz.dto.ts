import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class QuizAnswerDto {
  @ApiProperty({ example: 'q1' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ example: 'Blue' })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class SubmitQuizDto {
  @ApiProperty({ example: 'childId123' })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({ type: [QuizAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];

  @ApiProperty({ example: 180, description: 'Time spent in seconds' })
  @IsNumber()
  timeSpent: number;
}
