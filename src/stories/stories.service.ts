import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story } from './schemas/story.schema';
import { CreateStoryDto } from './dto/create-story.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StoriesService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<Story>,
    private configService: ConfigService,
  ) {}

  async create(createStoryDto: CreateStoryDto): Promise<Story> {
    // Generate AI story from items
    const storyText = await this.generateStory(createStoryDto.items, createStoryDto.childId);

    const story = await this.storyModel.create({
      ...createStoryDto,
      text: storyText,
      mode: createStoryDto.mode || 'narration',
    });

    return story.populate('items');
  }

  async findAllByChild(childId: string): Promise<Story[]> {
    return this.storyModel.find({ childId }).populate('items').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Story> {
    const story = await this.storyModel.findById(id).populate('items').exec();
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    return story;
  }

  async remove(id: string): Promise<{ message: string }> {
    const story = await this.storyModel.findByIdAndDelete(id).exec();
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    return { message: 'Story deleted successfully' };
  }

  async shareStory(id: string, isShared: boolean): Promise<Story> {
    const story = await this.storyModel.findByIdAndUpdate(id, { isShared }, { new: true }).exec();
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    return story;
  }

  private async generateStory(items: string[], childId: string): Promise<string> {
    // TODO: Integrate with AI service (OpenAI, etc.)
    // For now, return a template story
    return `Once upon a time, there was an adventure involving ${items.length} special items. Each item had its own magic...`;
  }
}
