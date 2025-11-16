import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateKidDto {
  @ApiPropertyOptional({ example: 'Nour Updated', description: 'Updated kid name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'avatar_2.png', description: 'Updated avatar URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ example: 8, description: 'Updated age (4-12)' })
  @IsNumber()
  @IsOptional()
  @Min(4)
  @Max(12)
  age?: number;

  @ApiPropertyOptional({ 
    example: '7-9', 
    enum: ['4-6', '7-9', '10-12'], 
    description: 'Updated level group' 
  })
  @IsEnum(['4-6', '7-9', '10-12'])
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({ example: 'Grade 3', description: 'Updated grade/class' })
  @IsString()
  @IsOptional()
  grade?: string;
}
