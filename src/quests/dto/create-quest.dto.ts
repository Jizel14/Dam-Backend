import { IsString, IsNotEmpty, IsEnum, IsObject, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateQuestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(['colors', 'shapes', 'classroom', 'custom'])
  template: string;

  @IsNumber()
  @Min(3)
  @Max(10)
  items: number;

  @IsNumber()
  @IsOptional()
  timeLimit?: number;

  @IsBoolean()
  @IsOptional()
  requireAdjective?: boolean;

  @IsString({ each: true })
  @IsOptional()
  targetWords?: string[];

  @IsNumber()
  @IsOptional()
  expiresInDays?: number;
}
