import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
  ) {}

  async create(userId: string, createLessonDto: CreateLessonDto): Promise<Lesson> {
    const lesson = await this.lessonModel.create({
      ...createLessonDto,
      createdBy: userId,
    });
    return lesson.populate('targetWords');
  }

  async findAll(level?: string, category?: string, isPublic?: boolean): Promise<Lesson[]> {
    const filter: any = { isActive: true };
    if (level) filter.level = level;
    if (category) filter.category = category;
    if (isPublic !== undefined) filter.isPublic = isPublic;

    return this.lessonModel.find(filter).populate('targetWords').populate('createdBy', 'name email').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel.findById(id).populate('targetWords').populate('createdBy', 'name').exec();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async findByTeacher(teacherId: string): Promise<Lesson[]> {
    return this.lessonModel.find({ createdBy: teacherId, isActive: true }).populate('targetWords').sort({ createdAt: -1 }).exec();
  }

  async update(id: string, userId: string, userRoles: string[], updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.lessonModel.findById(id).exec();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check ownership or admin
    if (lesson.createdBy.toString() !== userId && !userRoles.includes('admin')) {
      throw new ForbiddenException('You can only update your own lessons');
    }

    const updated = await this.lessonModel.findByIdAndUpdate(id, updateLessonDto, { new: true }).populate('targetWords').exec();
    if (!updated) {
      throw new NotFoundException('Lesson not found after update');
    }
    return updated;
  }

  async remove(id: string, userId: string, userRoles: string[]): Promise<{ message: string }> {
    const lesson = await this.lessonModel.findById(id).exec();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.createdBy.toString() !== userId && !userRoles.includes('admin')) {
      throw new ForbiddenException('You can only delete your own lessons');
    }

    await this.lessonModel.findByIdAndUpdate(id, { isActive: false }).exec();
    return { message: 'Lesson deleted successfully' };
  }
}
