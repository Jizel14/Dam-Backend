import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ScanEvent extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ChildProfile', required: true })
  childId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Word', required: true })
  wordId: Types.ObjectId;

  @Prop({ required: true })
  scorePhonemic: number;

  @Prop({ default: 1 })
  attempts: number;

  @Prop({ default: false })
  mastered: boolean;

  @Prop()
  sessionId: string;
}

export const ScanEventSchema = SchemaFactory.createForClass(ScanEvent);

ScanEventSchema.index({ childId: 1, wordId: 1 });
