import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuestsService } from './quests.service';
import { CreateQuestDto } from './dto/create-quest.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '../auth/enums/role.enums';

@ApiTags('Quests')
@Controller('quests')
@UseGuards(AuthGuard())
@ApiBearerAuth('JWT-auth')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Create a new quest (Teacher/Parent)' })
  create(@Request() req, @Body() createQuestDto: CreateQuestDto) {
    return this.questsService.create(req.user.id, createQuestDto);
  }

  @Get('my-quests')
  @ApiOperation({ summary: 'Get all quests created by current user' })
  findMyQuests(@Request() req) {
    return this.questsService.findAllByOwner(req.user.id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get quest by code' })
  findByCode(@Param('code') code: string) {
    return this.questsService.findByCode(code);
  }

  @Post('join/:code')
  @ApiOperation({ summary: 'Join a quest using code' })
  joinQuest(@Param('code') code: string, @Body('childId') childId: string) {
    return this.questsService.joinQuest(code, childId);
  }

  @Post(':questId/complete')
  @ApiOperation({ summary: 'Complete a quest item' })
  completeItem(
    @Param('questId') questId: string,
    @Body('childId') childId: string,
    @Body('word') word: string,
  ) {
    return this.questsService.completeQuestItem(questId, childId, word);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get quest statistics' })
  getStats(@Param('id') id: string) {
    return this.questsService.getQuestStats(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quest' })
  remove(@Request() req, @Param('id') id: string) {
    return this.questsService.remove(id, req.user.id);
  }
}
