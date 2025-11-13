import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import { CreateChildProfileDto } from './dto/create-child-profile.dto';
import { UpdateChildProfileDto } from './dto/update-child-profile.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Children')
@Controller('children')
@UseGuards(AuthGuard())
@ApiBearerAuth('JWT-auth')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @ApiOperation({ summary: 'Create child profile' })
  create(@Request() req, @Body() createChildProfileDto: CreateChildProfileDto) {
    return this.childrenService.create(req.user.id, createChildProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all children for current user' })
  findAll(@Request() req) {
    return this.childrenService.findAllByParent(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get child profile by ID' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.childrenService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update child profile' })
  update(@Request() req, @Param('id') id: string, @Body() updateChildProfileDto: UpdateChildProfileDto) {
    return this.childrenService.update(id, req.user.id, updateChildProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete child profile' })
  remove(@Request() req, @Param('id') id: string) {
    return this.childrenService.remove(id, req.user.id);
  }

  @Post(':id/xp')
  @ApiOperation({ summary: 'Add XP to child' })
  addXP(@Param('id') id: string, @Body('xp') xp: number) {
    return this.childrenService.addXP(id, xp);
  }

  @Post(':id/pet-part')
  @ApiOperation({ summary: 'Add pet part to child' })
  addPetPart(@Param('id') id: string, @Body('part') part: string) {
    return this.childrenService.addPetPart(id, part);
  }
}
