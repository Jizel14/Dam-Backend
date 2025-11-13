import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TwinSession } from './schemas/twin-session.schema';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { CompleteRoundDto } from './dto/complete-round.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TwinTalkService {
  constructor(
    @InjectModel(TwinSession.name) private twinSessionModel: Model<TwinSession>,
  ) {}

  async createSession(createSessionDto: CreateSessionDto): Promise<TwinSession> {
    const code = uuidv4().substring(0, 8).toUpperCase();

    const session = await this.twinSessionModel.create({
      code,
      players: [createSessionDto.player1Id],
      status: 'waiting',
      gameType: createSessionDto.gameType,
      timeLimit: createSessionDto.timeLimit || 90,
    });

    return session;
  }

  async joinSession(joinSessionDto: JoinSessionDto): Promise<TwinSession> {
    const session = await this.twinSessionModel.findOne({ code: joinSessionDto.code }).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== 'waiting') {
      throw new BadRequestException('Session already started or completed');
    }

    if (session.players.length >= 2) {
      throw new BadRequestException('Session is full');
    }

    session.players.push(joinSessionDto.player2Id as any);
    session.status = 'in-progress';
    await session.save();

    return session;
  }

  async getSession(code: string): Promise<TwinSession> {
    const session = await this.twinSessionModel.findOne({ code }).populate('players').exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async completeRound(sessionId: string, completeRoundDto: CompleteRoundDto): Promise<TwinSession> {
    const session = await this.twinSessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.rounds.push(completeRoundDto as any);
    await session.save();

    return session;
  }

  async completeSession(sessionId: string): Promise<TwinSession> {
    const session = await this.twinSessionModel.findById(sessionId).populate('players').exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Calculate final scores
    const player1Score = session.rounds.filter(r => r.winnerId.toString() === session.players[0].toString()).reduce((sum, r) => sum + r.points, 0);
    const player2Score = session.rounds.filter(r => r.winnerId.toString() === session.players[1].toString()).reduce((sum, r) => sum + r.points, 0);

    session.finalScore = {
      player1: { id: session.players[0], score: player1Score },
      player2: { id: session.players[1], score: player2Score },
    };
    session.status = 'completed';
    session.completedAt = new Date();

    await session.save();
    return session;
  }

  async getChildSessions(childId: string): Promise<TwinSession[]> {
    return this.twinSessionModel.find({ players: childId }).populate('players').sort({ createdAt: -1 }).exec();
  }

  async abandonSession(sessionId: string): Promise<TwinSession> {
    const session = await this.twinSessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.status = 'abandoned';
    await session.save();
    return session;
  }

  async getActiveSessionByPlayer(playerId: string): Promise<TwinSession | null> {
    return this.twinSessionModel.findOne({
      players: playerId,
      status: { $in: ['waiting', 'in-progress'] },
    }).exec();
  }
}