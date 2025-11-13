import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateChildProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  avatar: string;

  @IsEnum(['4-6', '7-9', '10-12'])
  level: string;

  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(120)
  timeLimitMinutes?: number;

  @IsString()
  @IsOptional()
  targetLanguage?: string;
}
