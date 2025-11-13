import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TwinTalkService } from './twin-talk.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { CompleteRoundDto } from './dto/complete-round.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Twin-Talk')
@Controller('twin-talk')
@UseGuards(AuthGuard())
@ApiBearerAuth('JWT-auth')
export class TwinTalkController {
  constructor(private readonly twinTalkService: TwinTalkService) {}

  @Post('session')
  @ApiOperation({ 
    summary: 'Create Twin-Talk session',
    description: 'Create a new co-play session for two kids. Returns unique 8-character code for the second player to join. Choose from 3 game types: describe-find, scramble-relay, or word-race.'
  })
  @ApiResponse({ status: 201, description: 'Session created successfully with join code. Share code with second player.' })
  @ApiResponse({ status: 400, description: 'Invalid game type or player ID.' })
  createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.twinTalkService.createSession(createSessionDto);
  }

  @Post('session/join')
  @ApiOperation({ 
    summary: 'Join Twin-Talk session',
    description: 'Second player joins using 8-character session code. Session starts immediately when both players connected. Game begins with first round.'
  })
  @ApiResponse({ status: 200, description: 'Successfully joined session. Game starting now.' })
  @ApiResponse({ status: 404, description: 'Session not found with this code.' })
  @ApiResponse({ status: 400, description: 'Session already full, started, or completed.' })
  joinSession(@Body() joinSessionDto: JoinSessionDto) {
    return this.twinTalkService.joinSession(joinSessionDto);
  }

  @Get('session/:code')
  @ApiOperation({ 
    summary: 'Get session details',
    description: 'Retrieve current session state including players, rounds completed, current scores, and game status. Poll this endpoint during gameplay for real-time updates.'
  })
  @ApiResponse({ status: 200, description: 'Session details with player info and current state.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  getSession(@Param('code') code: string) {
    return this.twinTalkService.getSession(code);
  }

  @Post('session/:id/round')
  @ApiOperation({ 
    summary: 'Complete a round',
    description: 'Submit round results: winner, time spent, points earned, and word used. Call this after each round completion. App calculates running scores automatically.'
  })
  @ApiResponse({ status: 200, description: 'Round completed. Scores updated. Ready for next round.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  completeRound(@Param('id') id: string, @Body() completeRoundDto: CompleteRoundDto) {
    return this.twinTalkService.completeRound(id, completeRoundDto);
  }

  @Post('session/:id/complete')
  @ApiOperation({ 
    summary: 'Complete session',
    description: 'Finalize session after all rounds. Calculates final scores, determines winner, saves session to history. Both players receive completion rewards.'
  })
  @ApiResponse({ status: 200, description: 'Session completed. Final scores calculated. Winner determined.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  completeSession(@Param('id') id: string) {
    return this.twinTalkService.completeSession(id);
  }

  @Get('history/child/:childId')
  @ApiOperation({ 
    summary: 'Get child session history',
    description: 'Retrieve all Twin-Talk sessions for a specific child including completed games, scores, game types, and co-players. Useful for parent/teacher progress tracking.'
  })
  @ApiResponse({ status: 200, description: 'Array of session history with detailed results and statistics.' })
  getChildHistory(@Param('childId') childId: string) {
    return this.twinTalkService.getChildSessions(childId);
  }
}
