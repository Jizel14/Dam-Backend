import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScanEvent } from './schemas/scan-event.schema';
import { CreateScanEventDto } from './dto/create-scan-event.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(ScanEvent.name) private scanEventModel: Model<ScanEvent>,
  ) {}

  async recordScan(createScanEventDto: CreateScanEventDto): Promise<ScanEvent> {
    // Check if word was scanned before
    const existingEvent = await this.scanEventModel.findOne({
      childId: createScanEventDto.childId,
      wordId: createScanEventDto.wordId,
    }).exec();

    if (existingEvent) {
      existingEvent.attempts += 1;
      existingEvent.scorePhonemic = createScanEventDto.scorePhonemic;
      
      if (createScanEventDto.scorePhonemic >= 80 && existingEvent.attempts >= 3) {
        existingEvent.mastered = true;
      }
      
      await existingEvent.save();
      return existingEvent;
    }

    const scanEvent = await this.scanEventModel.create(createScanEventDto);
    return scanEvent;
  }

  async getChildProgress(childId: string): Promise<any> {
    const events = await this.scanEventModel.find({ childId }).populate('wordId').exec();

    const newWords = events.filter(e => e.attempts === 1).length;
    const masteredWords = events.filter(e => e.mastered).length;
    const totalAttempts = events.reduce((sum, e) => sum + e.attempts, 0);
    const avgScore = events.length > 0 
      ? events.reduce((sum, e) => sum + e.scorePhonemic, 0) / events.length 
      : 0;

    return {
      totalWords: events.length,
      newWords,
      masteredWords,
      inProgress: events.length - masteredWords,
      totalAttempts,
      avgScore: Math.round(avgScore),
      recentScans: events.slice(0, 10),
    };
  }

  async getWeeklyStats(childId: string): Promise<any> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const events = await this.scanEventModel.find({
      childId,
      createdAt: { $gte: weekAgo },
    }).populate('wordId').exec();

    return {
      scansThisWeek: events.length,
      newWordsThisWeek: events.filter(e => e.attempts === 1).length,
      masteredThisWeek: events.filter(e => e.mastered).length,
    };
  }
}
