import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '../auth/enums/role.enums';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create new quiz (Teacher/Admin only)',
    description: 'Create interactive quizzes with multiple question types (multiple-choice, pronunciation, matching, fill-in-blank). Set time limits and assign to lessons.'
  })
  @ApiResponse({ status: 201, description: 'Quiz created successfully with unique question IDs.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teacher or Admin role required.' })
  create(@Request() req, @Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(req.user.id, createQuizDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all quizzes',
    description: 'Retrieve all active quizzes. Optional filtering by age level (4-6, 7-9, 10-12).'
  })
  @ApiQuery({ name: 'level', required: false, enum: ['4-6', '7-9', '10-12'], description: 'Filter by age group' })
  @ApiResponse({ status: 200, description: 'Array of quizzes with associated lessons and creators.' })
  findAll(@Query('level') level?: string) {
    return this.quizzesService.findAll(level);
  }

  @Get('my-quizzes')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get my quizzes (Teacher only)',
    description: 'Retrieve all quizzes created by the authenticated teacher for management purposes.'
  })
  @ApiResponse({ status: 200, description: 'List of quizzes created by current teacher.' })
  findMyQuizzes(@Request() req) {
    return this.quizzesService.findByTeacher(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get quiz by ID',
    description: 'Retrieve complete quiz details including all questions, correct answers, and settings. Use for taking the quiz.'
  })
  @ApiResponse({ status: 200, description: 'Quiz with full question details.' })
  @ApiResponse({ status: 404, description: 'Quiz not found.' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Post(':id/submit')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Submit quiz answers',
    description: 'Submit child answers for automatic grading. Returns score, correct answers, and time spent. Creates a quiz attempt record.'
  })
  @ApiResponse({ status: 201, description: 'Quiz graded successfully. Returns score and detailed results.' })
  @ApiResponse({ status: 404, description: 'Quiz not found.' })
  submitQuiz(@Param('id') id: string, @Body() submitQuizDto: SubmitQuizDto) {
    return this.quizzesService.submitQuiz(id, submitQuizDto);
  }

  @Get('attempts/child/:childId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.PARENT, Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get child quiz attempts (Parent/Teacher/Admin)',
    description: 'View all quiz attempts for a specific child including scores, answers, and completion times. Parents see their kids only.'
  })
  @ApiResponse({ status: 200, description: 'Array of quiz attempts with populated quiz info.' })
  getChildAttempts(@Param('childId') childId: string) {
    return this.quizzesService.getChildAttempts(childId);
  }

  @Get(':id/attempts')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get quiz attempts (Teacher/Admin)',
    description: 'View all student attempts for a specific quiz. Useful for analyzing quiz difficulty and student performance.'
  })
  @ApiResponse({ status: 200, description: 'Array of all attempts for this quiz with child info.' })
  getQuizAttempts(@Param('id') id: string) {
    return this.quizzesService.getQuizAttempts(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete quiz (Owner/Admin only)',
    description: 'Soft delete a quiz. Only the creator or admin can delete. Previous attempts remain in database.'
  })
  @ApiResponse({ status: 200, description: 'Quiz deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only delete your own quizzes.' })
  remove(@Request() req, @Param('id') id: string) {
    return this.quizzesService.remove(id, req.user.id, req.user.roles);
  }
}
