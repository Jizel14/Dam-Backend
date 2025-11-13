import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '../auth/enums/role.enums';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create new lesson (Teacher/Admin only)',
    description: 'Teachers and admins can create structured lessons with vocabulary, activities, and learning objectives for specific age groups.'
  })
  @ApiResponse({ status: 201, description: 'Lesson created successfully with populated word references.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teacher or Admin role required.' })
  create(@Request() req, @Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(req.user.id, createLessonDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all lessons',
    description: 'Retrieve all active lessons. Can be filtered by level, category, or public visibility. Public lessons are available to all users.'
  })
  @ApiQuery({ name: 'level', required: false, enum: ['4-6', '7-9', '10-12'], description: 'Filter by age group' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (colors, shapes, etc.)' })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean, description: 'Filter public lessons only' })
  @ApiResponse({ status: 200, description: 'Array of lessons with populated target words and creator info.' })
  findAll(
    @Query('level') level?: string,
    @Query('category') category?: string,
    @Query('isPublic') isPublic?: boolean,
  ) {
    return this.lessonsService.findAll(level, category, isPublic);
  }

  @Get('my-lessons')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get my lessons (Teacher only)',
    description: 'Retrieve all lessons created by the authenticated teacher. Useful for managing personal lesson library.'
  })
  @ApiResponse({ status: 200, description: 'List of lessons created by current teacher.' })
  findMyLessons(@Request() req) {
    return this.lessonsService.findByTeacher(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get lesson by ID',
    description: 'Retrieve detailed lesson information including content, target words, activities, and creator details.'
  })
  @ApiResponse({ status: 200, description: 'Lesson details with full content.' })
  @ApiResponse({ status: 404, description: 'Lesson not found.' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update lesson (Owner/Admin only)',
    description: 'Update lesson content, settings, or visibility. Only the lesson creator or admin can modify.'
  })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only update your own lessons.' })
  @ApiResponse({ status: 404, description: 'Lesson not found.' })
  update(@Request() req, @Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(id, req.user.id, req.user.roles, updateLessonDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete lesson (Owner/Admin only)',
    description: 'Soft delete a lesson by marking it as inactive. Only creator or admin can delete.'
  })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only delete your own lessons.' })
  remove(@Request() req, @Param('id') id: string) {
    return this.lessonsService.remove(id, req.user.id, req.user.roles);
  }
}
