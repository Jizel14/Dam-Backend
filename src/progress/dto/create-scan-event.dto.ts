import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateScanEventDto {
  @IsString()
  @IsNotEmpty()
  childId: string;

  @IsString()
  @IsNotEmpty()
  wordId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  scorePhonemic: number;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
