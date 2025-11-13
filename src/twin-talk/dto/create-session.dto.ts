import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: 'childId123', description: 'First player (child profile ID)' })
  @IsString()
  @IsNotEmpty()
  player1Id: string;

  @ApiProperty({ example: 'describe-find', enum: ['describe-find', 'scramble-relay', 'word-race'], description: 'Game type' })
  @IsEnum(['describe-find', 'scramble-relay', 'word-race'])
  gameType: string;

  @ApiProperty({ example: 90, description: 'Time limit per round in seconds', required: false })
  @IsNumber()
  @IsOptional()
  @Min(30)
  @Max(180)
  timeLimit?: number;
}
