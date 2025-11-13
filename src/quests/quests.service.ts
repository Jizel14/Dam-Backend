import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quest } from './schemas/quest.schema';
import { QuestProgress } from './schemas/quest-progress.schema';
import { CreateQuestDto } from './dto/create-quest.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuestsService {
  constructor(
    @InjectModel(Quest.name) private questModel: Model<Quest>,
    @InjectModel(QuestProgress.name) private questProgressModel: Model<QuestProgress>,
  ) {}

  async create(ownerId: string, createQuestDto: CreateQuestDto): Promise<Quest> {
    const code = uuidv4().substring(0, 8).toUpperCase();
    
    const expiresAt = createQuestDto.expiresInDays 
      ? new Date(Date.now() + createQuestDto.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const quest = await this.questModel.create({
      ownerId,
      title: createQuestDto.title,
      template: createQuestDto.template,
      params: {
        items: createQuestDto.items,
        timeLimit: createQuestDto.timeLimit,
        requireAdjective: createQuestDto.requireAdjective,
        targetWords: createQuestDto.targetWords,
      },
      code,
      expiresAt,
      stats: {
        completed: 0,
        inProgress: 0,
        difficultWords: [],
      },
    });

    return quest;
  }

  async findAllByOwner(ownerId: string): Promise<Quest[]> {
    return this.questModel.find({ ownerId, isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async findByCode(code: string): Promise<Quest> {
    const quest = await this.questModel.findOne({ code, isActive: true }).exec();
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }
    return quest;
  }

  async joinQuest(code: string, childId: string): Promise<QuestProgress> {
    const quest = await this.findByCode(code);

    // Check if already joined
    let progress = await this.questProgressModel.findOne({ questId: quest._id, childId }).exec();
    
    if (!progress) {
      progress = await this.questProgressModel.create({
        questId: quest._id,
        childId,
        totalItems: quest.params.items,
        status: 'in-progress',
      });

      await this.questModel.findByIdAndUpdate(quest._id, {
        $addToSet: { participants: childId },
        $inc: { 'stats.inProgress': 1 },
      });
    }

    return progress;
  }

  async completeQuestItem(questId: string, childId: string, word: string): Promise<QuestProgress> {
    const progress = await this.questProgressModel.findOne({ questId, childId }).exec();
    if (!progress) {
      throw new NotFoundException('Quest progress not found');
    }

    progress.itemsCompleted += 1;
    progress.scannedWords.push(word);

    if (progress.itemsCompleted >= progress.totalItems) {
      progress.status = 'completed';
      progress.completedAt = new Date();

      await this.questModel.findByIdAndUpdate(questId, {
        $inc: { 'stats.completed': 1, 'stats.inProgress': -1 },
      });
    }

    await progress.save();
    return progress;
  }

  async getQuestStats(questId: string): Promise<any> {
    const quest = await this.questModel.findById(questId).exec();
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    const progressList = await this.questProgressModel.find({ questId }).populate('childId').exec();

    return {
      quest,
      participants: progressList,
      completionRate: quest.stats.completed / (quest.stats.completed + quest.stats.inProgress) * 100,
    };
  }

  async remove(id: string, ownerId: string): Promise<{ message: string }> {
    const quest = await this.questModel.findOneAndUpdate(
      { _id: id, ownerId },
      { isActive: false },
      { new: true },
    ).exec();
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }
    return { message: 'Quest deleted successfully' };
  }
}
