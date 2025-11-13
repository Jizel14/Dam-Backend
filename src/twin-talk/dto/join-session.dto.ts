import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinSessionDto {
  @ApiProperty({ example: 'ABCD1234', description: '8-character session code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'childId456', description: 'Second player (child profile ID)' })
  @IsString()
  @IsNotEmpty()
  player2Id: string;
}
