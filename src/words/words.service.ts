import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Word } from './schemas/word.schema';
import { Category } from './schemas/category.schema';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(Word.name) private wordModel: Model<Word>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createWordDto: CreateWordDto): Promise<Word> {
    const word = await this.wordModel.create(createWordDto);
    return word;
  }

  async findAll(category?: string, level?: string, language?: string): Promise<Word[]> {
    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (language) filter.language = language;

    return this.wordModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Word> {
    const word = await this.wordModel.findById(id).exec();
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return word;
  }

  async update(id: string, updateWordDto: UpdateWordDto): Promise<Word> {
    const word = await this.wordModel.findByIdAndUpdate(id, updateWordDto, { new: true }).exec();
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return word;
  }

  async remove(id: string): Promise<{ message: string }> {
    const word = await this.wordModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return { message: 'Word deleted successfully' };
  }

  async findByCategory(category: string): Promise<Word[]> {
    return this.wordModel.find({ category, isActive: true }).exec();
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryModel.find({ isActive: true }).sort({ order: 1 }).exec();
  }

  async createCategory(name: string, description?: string, iconUrl?: string): Promise<Category> {
    return this.categoryModel.create({ name, description, iconUrl });
  }
}
