import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class QuestProgress extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Quest', required: true })
  questId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ChildProfile', required: true })
  childId: Types.ObjectId;

  @Prop({ default: 0 })
  itemsCompleted: number;

  @Prop({ default: 0 })
  totalItems: number;

  @Prop({ default: 'in-progress', enum: ['in-progress', 'completed', 'abandoned'] })
  status: string;

  @Prop({ type: [String], default: [] })
  scannedWords: string[];

  @Prop()
  completedAt: Date;
}

export const QuestProgressSchema = SchemaFactory.createForClass(QuestProgress);

QuestProgressSchema.index({ questId: 1, childId: 1 }, { unique: true });
