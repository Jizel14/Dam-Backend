import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CreateScanEventDto } from './dto/create-scan-event.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(AuthGuard())
@ApiBearerAuth('JWT-auth')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('scan')
  @ApiOperation({ summary: 'Record a scan event' })
  recordScan(@Body() createScanEventDto: CreateScanEventDto) {
    return this.progressService.recordScan(createScanEventDto);
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Get child progress' })
  getChildProgress(@Param('childId') childId: string) {
    return this.progressService.getChildProgress(childId);
  }

  @Get('child/:childId/weekly')
  @ApiOperation({ summary: 'Get weekly statistics for child' })
  getWeeklyStats(@Param('childId') childId: string) {
    return this.progressService.getWeeklyStats(childId);
  }
}
