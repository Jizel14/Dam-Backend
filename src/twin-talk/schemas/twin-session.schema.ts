import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TwinSession extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ChildProfile' }], required: true })
  players: Types.ObjectId[];

  @Prop({ required: true, enum: ['waiting', 'in-progress', 'completed', 'abandoned'] })
  status: string;

  @Prop({ required: true, enum: ['describe-find', 'scramble-relay', 'word-race'] })
  gameType: string;

  @Prop({ type: [Object], default: [] })
  rounds: {
    roundNumber: number;
    wordId: Types.ObjectId;
    winnerId: Types.ObjectId;
    timeSpent: number;
    points: number;
  }[];

  @Prop({ type: Object })
  finalScore: {
    player1: { id: Types.ObjectId; score: number };
    player2: { id: Types.ObjectId; score: number };
  };

  @Prop()
  completedAt: Date;

  @Prop({ default: 90 })
  timeLimit: number; // seconds per round
}

export const TwinSessionSchema = SchemaFactory.createForClass(TwinSession);
