import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteRoundDto {
  @ApiProperty({ example: 1, description: 'Round number' })
  @IsNumber()
  @Min(1)
  roundNumber: number;

  @ApiProperty({ example: 'wordId123', description: 'Word used in this round' })
  @IsString()
  @IsNotEmpty()
  wordId: string;

  @ApiProperty({ example: 'childId123', description: 'Winner of this round' })
  @IsString()
  @IsNotEmpty()
  winnerId: string;

  @ApiProperty({ example: 45, description: 'Time spent in seconds' })
  @IsNumber()
  @Min(0)
  timeSpent: number;

  @ApiProperty({ example: 100, description: 'Points earned' })
  @IsNumber()
  @Min(0)
  points: number;
}
