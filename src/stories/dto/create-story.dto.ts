import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  @IsNotEmpty()
  childId: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(4)
  items: string[];

  @IsEnum(['narration', 'finish'])
  @IsOptional()
  mode?: string;
}
