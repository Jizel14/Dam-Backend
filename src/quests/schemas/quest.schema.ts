import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Quest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ['colors', 'shapes', 'classroom', 'custom'] })
  template: string;

  @Prop({ type: Object, required: true })
  params: {
    items: number;
    timeLimit?: number;
    requireAdjective?: boolean;
    targetWords?: string[];
  };

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ChildProfile' }], default: [] })
  participants: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  stats: {
    completed: number;
    inProgress: number;
    difficultWords: string[];
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  expiresAt: Date;
}

export const QuestSchema = SchemaFactory.createForClass(Quest);
