import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, IsUrl } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  lemma: string;

  @IsString()
  @IsNotEmpty()
  translation: string;

  @IsArray()
  @IsNotEmpty()
  phonemes: string[];

  @IsString()
  @IsNotEmpty()
  audioUrl: string;

  @IsString()
  @IsOptional()
  illustrationUrl?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(['4-6', '7-9', '10-12'])
  level: string;

  @IsString()
  @IsOptional()
  language?: string;
}
