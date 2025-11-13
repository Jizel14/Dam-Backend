import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChildProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  avatar: string;

  @Prop({ required: true, enum: ['4-6', '7-9', '10-12'] })
  level: string;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 30 })
  timeLimitMinutes: number;

  @Prop({ type: [String], default: [] })
  petParts: string[];

  @Prop({ default: 'en' })
  targetLanguage: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ChildProfileSchema = SchemaFactory.createForClass(ChildProfile);
